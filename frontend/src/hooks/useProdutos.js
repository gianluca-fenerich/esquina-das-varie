import { useCallback, useEffect, useMemo, useState } from "react";

import {
    FORMULARIO_VAZIO,
    validarDadosComerciais,
    prepararDadosParaFormulario,
    prepararDadosParaAPI,
    obterProdutoDaResposta,
    obterListaDaResposta
} from "../utils/produtosUtils";

import {
    listarProdutos,
    buscarProdutoPorCodigoBarras,
    consultarProdutoExterno,
    cadastrarProduto,
    atualizarProduto,
    excluirProduto
} from "../services/produtosService";

function useProdutos() {
    const [secaoAtual, setSecaoAtual] = useState("listagem");

    const [produtos, setProdutos] = useState([]);
    const [carregandoLista, setCarregandoLista] = useState(true);
    const [erroLista, setErroLista] = useState("");

    const [pesquisa, setPesquisa] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [mostrarTodos, setMostrarTodos] = useState(false);

    const [codigoBarrasCadastro, setCodigoBarrasCadastro] = useState("");
    const [dadosCadastro, setDadosCadastro] = useState(FORMULARIO_VAZIO);
    const [produtoExternoCadastro, setProdutoExternoCadastro] = useState(null);
    const [carregandoCadastro, setCarregandoCadastro] = useState(false);
    const [mensagemCadastro, setMensagemCadastro] = useState("");
    const [tipoMensagemCadastro, setTipoMensagemCadastro] = useState("erro");

    const [codigoBarrasEdicao, setCodigoBarrasEdicao] = useState("");
    const [produtoEdicao, setProdutoEdicao] = useState(null);
    const [dadosEdicao, setDadosEdicao] = useState(FORMULARIO_VAZIO);
    const [produtoExternoEdicao, setProdutoExternoEdicao] = useState(null);
    const [carregandoEdicao, setCarregandoEdicao] = useState(false);
    const [consultandoSI5Edicao, setConsultandoSI5Edicao] = useState(false);
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);
    const [mensagemEdicao, setMensagemEdicao] = useState("");
    const [tipoMensagemEdicao, setTipoMensagemEdicao] = useState("erro");

    const [produtoExclusao, setProdutoExclusao] = useState(null);
    const [confirmarExclusao, setConfirmarExclusao] = useState(false);
    const [carregandoExclusao, setCarregandoExclusao] = useState(false);
    const [mensagemExclusao, setMensagemExclusao] = useState("");
    const [tipoMensagemExclusao, setTipoMensagemExclusao] = useState("erro");

    const carregarProdutos = useCallback(async () => {
        setCarregandoLista(true);
        setErroLista("");

        try {
            const resposta = await listarProdutos();
            setProdutos(obterListaDaResposta(resposta));
        } catch (erro) {
            setErroLista(
                erro.message || "Não foi possível carregar os produtos."
            );
        } finally {
            setCarregandoLista(false);
        }
    }, []);

    useEffect(() => {
        let ignorarResposta = false;

        async function buscarProdutosInicial() {
            try {
                const resposta = await listarProdutos();

                if (!ignorarResposta) {
                    setProdutos(obterListaDaResposta(resposta));
                }
            } catch (erro) {
                if (!ignorarResposta) {
                    setErroLista(
                        erro.message || "Não foi possível carregar os produtos."
                    );
                }
            } finally {
                if (!ignorarResposta) {
                    setCarregandoLista(false);
                }
            }
        }
    
        buscarProdutosInicial();
    
        return () => {
            ignorarResposta = true;
        };
    }, []);

    const categorias = useMemo(() => {
        return [
            ...new Set(
                produtos
                    .map((produto) => produto.categoria)
                    .filter(Boolean)
            )
        ].sort((a, b) => a.localeCompare(b));
    }, [produtos]);

    const produtosFiltrados = useMemo(() => {
        const termo = pesquisa.trim().toLowerCase();

        return produtos.filter((produto) => {
            const correspondePesquisa =
                !termo ||
                String(produto.nome ?? "").toLowerCase().includes(termo) ||
                String(produto.codigoBarras ?? "").includes(termo) ||
                String(produto.marca ?? "").toLowerCase().includes(termo);

            const correspondeCategoria =
                !filtroCategoria ||
                produto.categoria === filtroCategoria;

            return correspondePesquisa && correspondeCategoria;
        });
    }, [produtos, pesquisa, filtroCategoria]);

    const produtosExibidos = mostrarTodos
        ? produtosFiltrados
        : produtosFiltrados.slice(0, 10);

    function mudarSecao(secao) {
        setSecaoAtual(secao);

        setMensagemCadastro("");
        setMensagemEdicao("");
        setMensagemExclusao("");
    }

    function atualizarCampoCadastro(campo, valor) {
        setDadosCadastro((atual) => ({
            ...atual,
            [campo]: valor
        }));
    }

    function atualizarCampoEdicao(campo, valor) {
        setDadosEdicao((atual) => ({
            ...atual,
            [campo]: valor
        }));
    }

    async function consultarProdutoCadastro(event) {
        event.preventDefault();

        const codigo = codigoBarrasCadastro.trim();

        if (!/^\d{8,14}$/.test(codigo)) {
            setMensagemCadastro(
                "Informe um código de barras válido, com 8 a 14 números."
            );
            setTipoMensagemCadastro("erro");
            return;
        }

        setCarregandoCadastro(true);
        setMensagemCadastro("");
        setProdutoExternoCadastro(null);
        setDadosCadastro(FORMULARIO_VAZIO);

        try {
            const respostaBanco =
                await buscarProdutoPorCodigoBarras(codigo);

            const produtoBanco = obterProdutoDaResposta(respostaBanco);

            if (produtoBanco?.id) {
                setMensagemCadastro(
                    "Este produto já está cadastrado. Utilize a seção Edição."
                );
                setTipoMensagemCadastro("erro");
                return;
            }

            throw new Error("Produto não encontrado.");
        } catch (erroBanco) {
            const mensagemErro = String(erroBanco.message ?? "");

            const produtoNaoEncontrado =
                mensagemErro.toLowerCase().includes("não encontrado");

            if (!produtoNaoEncontrado) {
                setMensagemCadastro(
                    mensagemErro || "Erro ao consultar o Supabase."
                );
                setTipoMensagemCadastro("erro");
                setCarregandoCadastro(false);
                return;
            }
        }

        try {
            const respostaSI5 = await consultarProdutoExterno(codigo);
            const produtoExterno = obterProdutoDaResposta(respostaSI5);

            setProdutoExternoCadastro(produtoExterno);

            setDadosCadastro({
                ...FORMULARIO_VAZIO,
                nome: produtoExterno.nome ?? "",
                codigoBarras: produtoExterno.codigoBarras ?? codigo,
                marca: produtoExterno.marca ?? "",
                categoria: produtoExterno.categoria ?? "",
                imagemUrl: produtoExterno.imagemUrl ?? ""
            });

            setMensagemCadastro(
                "Produto encontrado na SI5. Revise os dados e informe os valores comerciais."
            );
            setTipoMensagemCadastro("sucesso");
        } catch (erro) {
            setMensagemCadastro(
                erro.message || "Não foi possível consultar a SI5."
            );
            setTipoMensagemCadastro("erro");
        } finally {
            setCarregandoCadastro(false);
        }
    }

    async function salvarCadastroProduto(event) {
        event.preventDefault();

        const erroValidacao = validarDadosComerciais(dadosCadastro);

        if (erroValidacao) {
            setMensagemCadastro(erroValidacao);
            setTipoMensagemCadastro("erro");
            return;
        }

        setCarregandoCadastro(true);
        setMensagemCadastro("");

        try {
            const dadosAPI = prepararDadosParaAPI(dadosCadastro);

            const resposta = await cadastrarProduto(dadosAPI);
            const produtoCriado = obterProdutoDaResposta(resposta);

            setProdutos((atual) => [
                produtoCriado,
                ...atual.filter(
                    (produto) => produto.id !== produtoCriado.id
                )
            ]);

            setDadosCadastro(FORMULARIO_VAZIO);
            setCodigoBarrasCadastro("");
            setProdutoExternoCadastro(null);

            setMensagemCadastro("Produto cadastrado com sucesso.");
            setTipoMensagemCadastro("sucesso");
        } catch (erro) {
            setMensagemCadastro(
                erro.message || "Erro ao cadastrar produto."
            );
            setTipoMensagemCadastro("erro");
        } finally {
            setCarregandoCadastro(false);
        }
    }

    async function consultarProdutoEdicao(event) {
        event.preventDefault();

        const codigo = codigoBarrasEdicao.trim();

        if (!/^\d{8,14}$/.test(codigo)) {
            setMensagemEdicao(
                "Informe um código de barras válido, com 8 a 14 números."
            );
            setTipoMensagemEdicao("erro");
            return;
        }

        setCarregandoEdicao(true);
        setMensagemEdicao("");
        setProdutoEdicao(null);
        setProdutoExternoEdicao(null);
        setDadosEdicao(FORMULARIO_VAZIO);

        try {
            const resposta = await buscarProdutoPorCodigoBarras(codigo);
            const produto = obterProdutoDaResposta(resposta);

            if (!produto?.id) {
                throw new Error("Produto não encontrado no Supabase.");
            }

            setProdutoEdicao(produto);
            setDadosEdicao(prepararDadosParaFormulario(produto));

            setMensagemEdicao("Produto carregado para edição.");
            setTipoMensagemEdicao("sucesso");
        } catch (erro) {
            setMensagemEdicao(
                erro.message || "Não foi possível consultar o produto."
            );
            setTipoMensagemEdicao("erro");
        } finally {
            setCarregandoEdicao(false);
        }
    }

    async function consultarDadosSI5Edicao() {
        if (!produtoEdicao?.codigoBarras) {
            setMensagemEdicao(
                "O produto consultado não possui código de barras para consultar na SI5."
            );
            setTipoMensagemEdicao("erro");
            return;
        }

        setConsultandoSI5Edicao(true);
        setMensagemEdicao("");
        setProdutoExternoEdicao(null);

        try {
            const codigoOriginal = String(produtoEdicao.codigoBarras);

            const resposta =
                await consultarProdutoExterno(codigoOriginal);

            const produtoExterno = obterProdutoDaResposta(resposta);

            setProdutoExternoEdicao({
                ...produtoExterno,
                codigoBarras:
                    produtoExterno.codigoBarras ?? codigoOriginal
            });

            setMensagemEdicao(
                "Dados externos encontrados. Revise antes de aplicar ao formulário."
            );
            setTipoMensagemEdicao("sucesso");
        } catch (erro) {
            setMensagemEdicao(
                erro.message || "Não foi possível consultar os dados na SI5."
            );
            setTipoMensagemEdicao("erro");
        } finally {
            setConsultandoSI5Edicao(false);
        }
    }

    function aplicarDadosSI5NaEdicao() {
        if (!produtoExternoEdicao) {
            return;
        }

        setDadosEdicao((atual) => ({
            ...atual,
            nome: produtoExternoEdicao.nome ?? atual.nome,
            marca: produtoExternoEdicao.marca ?? atual.marca,
            categoria: produtoExternoEdicao.categoria ?? atual.categoria,
            imagemUrl: produtoExternoEdicao.imagemUrl ?? atual.imagemUrl
        }));

        setProdutoExternoEdicao(null);

        setMensagemEdicao(
            "Dados da SI5 aplicados ao formulário. Confira os campos e salve a edição."
        );
        setTipoMensagemEdicao("sucesso");
    }

    async function salvarEdicaoProduto(event) {
        event.preventDefault();

        if (!produtoEdicao?.id) {
            setMensagemEdicao("Consulte um produto antes de salvar.");
            setTipoMensagemEdicao("erro");
            return;
        }

        const erroValidacao = validarDadosComerciais(dadosEdicao);

        if (erroValidacao) {
            setMensagemEdicao(erroValidacao);
            setTipoMensagemEdicao("erro");
            return;
        }

        setSalvandoEdicao(true);
        setMensagemEdicao("");

        try {
            const dadosAPI = prepararDadosParaAPI(dadosEdicao);

            const resposta = await atualizarProduto(
                produtoEdicao.id,
                dadosAPI
            );

            const produtoAtualizado = {
                ...produtoEdicao,
                ...dadosAPI,
                ...obterProdutoDaResposta(resposta)
            };

            setProdutoEdicao(produtoAtualizado);
            setDadosEdicao(
                prepararDadosParaFormulario(produtoAtualizado)
            );

            setProdutos((atual) =>
                atual.map((produto) =>
                    produto.id === produtoAtualizado.id
                        ? produtoAtualizado
                        : produto
                )
            );

            setMensagemEdicao("Produto atualizado com sucesso.");
            setTipoMensagemEdicao("sucesso");
        } catch (erro) {
            setMensagemEdicao(
                erro.message || "Erro ao atualizar produto."
            );
            setTipoMensagemEdicao("erro");
        } finally {
            setSalvandoEdicao(false);
        }
    }

    function selecionarProdutoExclusao(id) {
        const produto = produtos.find(
            (item) => String(item.id) === String(id)
        );

        setProdutoExclusao(produto ?? null);
        setConfirmarExclusao(false);
        setMensagemExclusao("");
    }

    async function confirmarExclusaoProduto() {
        if (!produtoExclusao?.id) {
            return;
        }

        setCarregandoExclusao(true);
        setMensagemExclusao("");

        try {
            await excluirProduto(produtoExclusao.id);

            setProdutos((atual) =>
                atual.filter(
                    (produto) => produto.id !== produtoExclusao.id
                )
            );

            setProdutoExclusao(null);
            setConfirmarExclusao(false);

            setMensagemExclusao("Produto excluído com sucesso.");
            setTipoMensagemExclusao("sucesso");
        } catch (erro) {
            setMensagemExclusao(
                erro.message || "Erro ao excluir produto."
            );
            setTipoMensagemExclusao("erro");
        } finally {
            setCarregandoExclusao(false);
        }
    }

    return {
        secaoAtual,
        produtos,
        carregandoLista,
        erroLista,

        pesquisa,
        setPesquisa,
        filtroCategoria,
        setFiltroCategoria,
        mostrarTodos,
        setMostrarTodos,
        categorias,
        produtosFiltrados,
        produtosExibidos,

        codigoBarrasCadastro,
        setCodigoBarrasCadastro,
        dadosCadastro,
        produtoExternoCadastro,
        carregandoCadastro,
        mensagemCadastro,
        tipoMensagemCadastro,

        codigoBarrasEdicao,
        setCodigoBarrasEdicao,
        produtoEdicao,
        dadosEdicao,
        produtoExternoEdicao,
        carregandoEdicao,
        consultandoSI5Edicao,
        salvandoEdicao,
        mensagemEdicao,
        tipoMensagemEdicao,

        produtoExclusao,
        confirmarExclusao,
        setConfirmarExclusao,
        carregandoExclusao,
        mensagemExclusao,
        tipoMensagemExclusao,

        carregarProdutos,
        mudarSecao,
        atualizarCampoCadastro,
        atualizarCampoEdicao,
        consultarProdutoCadastro,
        salvarCadastroProduto,
        consultarProdutoEdicao,
        consultarDadosSI5Edicao,
        aplicarDadosSI5NaEdicao,
        salvarEdicaoProduto,
        selecionarProdutoExclusao,
        confirmarExclusaoProduto
    };
}

export default useProdutos;