import { useEffect, useMemo, useState } from "react";

import {
    listarProdutos,
    buscarProdutoPorCodigoBarras,
    consultarProdutoExterno,
    cadastrarProduto,
    atualizarProduto,
    excluirProduto
} from "../services/produtosService";

const SECOES = [
    { id: "listagem", nome: "Listagem" },
    { id: "cadastro", nome: "Cadastro" },
    { id: "edicao", nome: "Edição" },
    { id: "exclusao", nome: "Exclusão" }
];

const FORMULARIO_VAZIO = {
    nome: "",
    codigoBarras: "",
    marca: "",
    categoria: "",
    imagemUrl: "",
    precoCusto: "",
    precoVenda: "",
    quantidadeEstoque: ""
};

function formatarMoeda(valorEmCentavos) {
    if (valorEmCentavos === null || valorEmCentavos === undefined) {
        return "Não informado";
    }

    return (Number(valorEmCentavos) / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function converterCentavosParaReais(valorEmCentavos) {
    if (valorEmCentavos === null || valorEmCentavos === undefined) {
        return "";
    }

    return (Number(valorEmCentavos) / 100).toFixed(2);
}

function converterReaisParaCentavos(valor) {
    if (valor === "" || valor === null || valor === undefined) {
        return null;
    }

    const valorNumerico = Number(String(valor).replace(",", "."));

    if (!Number.isFinite(valorNumerico)) {
        return null;
    }

    return Math.round(valorNumerico * 100);
}

function validarDadosComerciais(dados) {
    const precoCustoCentavos = converterReaisParaCentavos(
        dados.precoCusto
    );

    const precoVendaCentavos = converterReaisParaCentavos(
        dados.precoVenda
    );

    const quantidadeEstoque = Number(dados.quantidadeEstoque);

    if (!dados.nome.trim()) {
        return "Informe o nome do produto.";
    }

    if (
        dados.codigoBarras.trim() &&
        !/^\d{8,14}$/.test(dados.codigoBarras.trim())
    ) {
        return "O código de barras deve conter entre 8 e 14 números.";
    }

    if (
        precoCustoCentavos === null ||
        precoCustoCentavos < 0
    ) {
        return "Informe um preço de custo válido.";
    }

    if (
        precoVendaCentavos === null ||
        precoVendaCentavos < 0
    ) {
        return "Informe um preço de venda válido.";
    }

    if (
        dados.quantidadeEstoque === "" ||
        !Number.isSafeInteger(quantidadeEstoque) ||
        quantidadeEstoque < 0
    ) {
        return "Informe uma quantidade de estoque válida.";
    }

    return null;
}

function prepararDadosParaFormulario(produto) {
    return {
        nome: produto.nome ?? "",
        codigoBarras: produto.codigoBarras ?? "",
        marca: produto.marca ?? "",
        categoria: produto.categoria ?? "",
        imagemUrl: produto.imagemUrl ?? "",
        precoCusto: converterCentavosParaReais(
            produto.precoCustoCentavos
        ),
        precoVenda: converterCentavosParaReais(
            produto.precoVendaCentavos
        ),
        quantidadeEstoque:
            produto.quantidadeEstoque === null ||
            produto.quantidadeEstoque === undefined
                ? ""
                : String(produto.quantidadeEstoque)
    };
}

function prepararDadosParaAPI(dados) {
    return {
        nome: dados.nome.trim(),
        codigoBarras: dados.codigoBarras.trim() || null,
        marca: dados.marca.trim() || null,
        categoria: dados.categoria.trim() || null,
        imagemUrl: dados.imagemUrl.trim() || null,
        precoCustoCentavos: converterReaisParaCentavos(
            dados.precoCusto
        ),
        precoVendaCentavos: converterReaisParaCentavos(
            dados.precoVenda
        ),
        quantidadeEstoque: Number(dados.quantidadeEstoque)
    };
}

function obterProdutoDaResposta(resposta) {
    return resposta?.produto ?? resposta?.dados ?? resposta;
}

function obterListaDaResposta(resposta) {
    if (Array.isArray(resposta)) {
        return resposta;
    }

    if (Array.isArray(resposta?.produtos)) {
        return resposta.produtos;
    }

    if (Array.isArray(resposta?.dados)) {
        return resposta.dados;
    }

    return [];
}

function CampoFormulario({
    label,
    value,
    onChange,
    type = "text",
    required = false,
    placeholder = "",
    min,
    step
}) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">
                {label}
            </span>

            <input
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                min={min}
                step={step}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
        </label>
    );
}

function Mensagem({ tipo = "erro", children }) {
    if (!children) {
        return null;
    }

    const classes =
        tipo === "sucesso"
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-700";

    return (
        <div className={`rounded-lg border px-4 py-3 text-sm ${classes}`}>
            {children}
        </div>
    );
}

function Produtos() {
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

    async function carregarProdutos() {
        setCarregandoLista(true);
        setErroLista("");

        try {
            const resposta = await listarProdutos();
            setProdutos(obterListaDaResposta(resposta));
        } catch (erro) {
            setErroLista(erro.message || "Não foi possível carregar os produtos.");
        } finally {
            setCarregandoLista(false);
        }
    }

    useEffect(() => {
        carregarProdutos();
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
            const respostaBanco = await buscarProdutoPorCodigoBarras(codigo);
            const produtoBanco = obterProdutoDaResposta(respostaBanco);

            if (produtoBanco?.id) {
                setMensagemCadastro(
                    "Este produto já está cadastrado. Utilize a seção Edição."
                );
                setTipoMensagemCadastro("erro");
                setCarregandoCadastro(false);
                return;
            }

            throw new Error("Produto não encontrado.");
        } catch (erroBanco) {
            if (
                erroBanco.message !== "Produto não encontrado." &&
                !erroBanco.message.toLowerCase().includes("não encontrado")
            ) {
                setMensagemCadastro(erroBanco.message);
                setTipoMensagemCadastro("erro");
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
                ...atual.filter((produto) => produto.id !== produtoCriado.id)
            ]);

            setDadosCadastro(FORMULARIO_VAZIO);
            setCodigoBarrasCadastro("");
            setProdutoExternoCadastro(null);

            setMensagemCadastro("Produto cadastrado com sucesso.");
            setTipoMensagemCadastro("sucesso");
        } catch (erro) {
            setMensagemCadastro(erro.message || "Erro ao cadastrar produto.");
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

            const resposta = await consultarProdutoExterno(codigoOriginal);
            const produtoExterno = obterProdutoDaResposta(resposta);

            setProdutoExternoEdicao({
                ...produtoExterno,
                codigoBarras: produtoExterno.codigoBarras ?? codigoOriginal
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
            setDadosEdicao(prepararDadosParaFormulario(produtoAtualizado));

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
            setMensagemEdicao(erro.message || "Erro ao atualizar produto.");
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
                atual.filter((produto) => produto.id !== produtoExclusao.id)
            );

            setProdutoExclusao(null);
            setConfirmarExclusao(false);

            setMensagemExclusao("Produto excluído com sucesso.");
            setTipoMensagemExclusao("sucesso");
        } catch (erro) {
            setMensagemExclusao(erro.message || "Erro ao excluir produto.");
            setTipoMensagemExclusao("erro");
        } finally {
            setCarregandoExclusao(false);
        }
    }

    return (
        <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">
                    Produtos
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Consulte, cadastre, edite e exclua produtos do catálogo.
                </p>
            </header>

            <nav className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
                {SECOES.map((secao) => (
                    <button
                        key={secao.id}
                        type="button"
                        onClick={() => mudarSecao(secao.id)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                            secaoAtual === secao.id
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        {secao.nome}
                    </button>
                ))}
            </nav>

            {secaoAtual === "listagem" && (
                <section className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            type="search"
                            value={pesquisa}
                            onChange={(event) => setPesquisa(event.target.value)}
                            placeholder="Pesquisar por nome, código ou marca..."
                            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <select
                            value={filtroCategoria}
                            onChange={(event) =>
                                setFiltroCategoria(event.target.value)
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                        >
                            <option value="">Todas as categorias</option>
                            {categorias.map((categoria) => (
                                <option key={categoria} value={categoria}>
                                    {categoria}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={carregarProdutos}
                            disabled={carregandoLista}
                            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Atualizar
                        </button>
                    </div>

                    <Mensagem>{erroLista}</Mensagem>

                    {carregandoLista ? (
                        <p className="py-8 text-center text-sm text-gray-500">
                            Carregando produtos...
                        </p>
                    ) : produtosFiltrados.length === 0 ? (
                        <p className="rounded-lg border border-gray-200 py-8 text-center text-sm text-gray-500">
                            Nenhum produto encontrado.
                        </p>
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <table className="w-full min-w-[760px] text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">
                                                Produto
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Código de barras
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Categoria
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Preço
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Estoque
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {produtosExibidos.map((produto) => (
                                            <tr
                                                key={produto.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {produto.imagemUrl ? (
                                                            <img
                                                                src={produto.imagemUrl}
                                                                alt={produto.nome}
                                                                className="h-10 w-10 rounded-md border border-gray-200 object-contain"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-md bg-gray-100" />
                                                        )}

                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {produto.nome}
                                                            </p>
                                                            {produto.marca && (
                                                                <p className="text-xs text-gray-500">
                                                                    {produto.marca}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-gray-600">
                                                    {produto.codigoBarras || "—"}
                                                </td>

                                                <td className="px-4 py-3 text-gray-600">
                                                    {produto.categoria || "—"}
                                                </td>

                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {formatarMoeda(
                                                        produto.precoVendaCentavos
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-gray-600">
                                                    {produto.quantidadeEstoque ?? "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                                <span>
                                    Exibindo {produtosExibidos.length} de{" "}
                                    {produtosFiltrados.length} produtos
                                </span>

                                {produtosFiltrados.length > 10 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMostrarTodos((atual) => !atual)
                                        }
                                        className="font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        {mostrarTodos
                                            ? "Mostrar menos"
                                            : "Mostrar todos"}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </section>
            )}

            {secaoAtual === "cadastro" && (
                <section className="max-w-3xl space-y-5">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Cadastrar produto
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Consulte o código no Supabase e, se ainda não estiver
                            cadastrado, busque os dados na SI5.
                        </p>
                    </div>

                    <form
                        onSubmit={consultarProdutoCadastro}
                        className="flex flex-col gap-3 sm:flex-row"
                    >
                        <input
                            value={codigoBarrasCadastro}
                            onChange={(event) =>
                                setCodigoBarrasCadastro(event.target.value)
                            }
                            placeholder="Código de barras"
                            inputMode="numeric"
                            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                        />

                        <button
                            type="submit"
                            disabled={carregandoCadastro}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {carregandoCadastro
                                ? "Consultando..."
                                : "Consultar produto"}
                        </button>
                    </form>

                    <Mensagem tipo={tipoMensagemCadastro}>
                        {mensagemCadastro}
                    </Mensagem>

                    {produtoExternoCadastro && (
                        <form
                            onSubmit={salvarCadastroProduto}
                            className="space-y-5 rounded-xl border border-gray-200 p-5"
                        >
                            <h3 className="font-semibold text-gray-900">
                                Dados do produto
                            </h3>

                            {dadosCadastro.imagemUrl && (
                                <img
                                    src={dadosCadastro.imagemUrl}
                                    alt={dadosCadastro.nome}
                                    className="h-32 w-32 rounded-lg border border-gray-200 object-contain"
                                />
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <CampoFormulario
                                    label="Nome"
                                    value={dadosCadastro.nome}
                                    onChange={(event) =>
                                        atualizarCampoCadastro(
                                            "nome",
                                            event.target.value
                                        )
                                    }
                                    required
                                />

                                <CampoFormulario
                                    label="Código de barras"
                                    value={dadosCadastro.codigoBarras}
                                    onChange={(event) =>
                                        atualizarCampoCadastro(
                                            "codigoBarras",
                                            event.target.value
                                        )
                                    }
                                />

                                <CampoFormulario
                                    label="Marca"
                                    value={dadosCadastro.marca}
                                    onChange={(event) =>
                                        atualizarCampoCadastro(
                                            "marca",
                                            event.target.value
                                        )
                                    }
                                />

                                <CampoFormulario
                                    label="Categoria"
                                    value={dadosCadastro.categoria}
                                    onChange={(event) =>
                                        atualizarCampoCadastro(
                                            "categoria",
                                            event.target.value
                                        )
                                    }
                                />

                                <CampoFormulario
                                    label="URL da imagem"
                                    value={dadosCadastro.imagemUrl}
                                    onChange={(event) =>
                                        atualizarCampoCadastro(
                                            "imagemUrl",
                                            event.target.value
                                        )
                                    }
                                />

                                <CampoFormulario
                                    label="Preço de custo (R$)"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={dadosCadastro.precoCusto}
                                    onChange={(event) =>
                                        atualizarCampoCadastro(
                                            "precoCusto",
                                            event.target.value
                                        )
                                    }
                                    required
                                />

                                <CampoFormulario
                                    label="Preço de venda (R$)"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={dadosCadastro.precoVenda}
                                    onChange={(event) =>
                                        atualizarCampoCadastro(
                                            "precoVenda",
                                            event.target.value
                                        )
                                    }
                                    required
                                />

                                <CampoFormulario
                                    label="Quantidade em estoque"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={dadosCadastro.quantidadeEstoque}
                                    onChange={(event) =>
                                        atualizarCampoCadastro(
                                            "quantidadeEstoque",
                                            event.target.value
                                        )
                                    }
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={carregandoCadastro}
                                className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                {carregandoCadastro
                                    ? "Salvando..."
                                    : "Cadastrar produto"}
                            </button>
                        </form>
                    )}
                </section>
            )}

            {secaoAtual === "edicao" && (
                <section className="max-w-3xl space-y-5">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Editar produto
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Consulte um produto cadastrado pelo código de barras.
                            Depois, você poderá complementar os dados pela SI5.
                        </p>
                    </div>

                    <form
                        onSubmit={consultarProdutoEdicao}
                        className="flex flex-col gap-3 sm:flex-row"
                    >
                        <input
                            value={codigoBarrasEdicao}
                            onChange={(event) =>
                                setCodigoBarrasEdicao(event.target.value)
                            }
                            placeholder="Código de barras do produto"
                            inputMode="numeric"
                            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                        />

                        <button
                            type="submit"
                            disabled={carregandoEdicao}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {carregandoEdicao
                                ? "Consultando..."
                                : "Consultar produto"}
                        </button>
                    </form>

                    <Mensagem tipo={tipoMensagemEdicao}>
                        {mensagemEdicao}
                    </Mensagem>

                    {produtoEdicao && (
                        <div className="space-y-5 rounded-xl border border-gray-200 p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                {dadosEdicao.imagemUrl ? (
                                    <img
                                        src={dadosEdicao.imagemUrl}
                                        alt={dadosEdicao.nome}
                                        className="h-28 w-28 rounded-lg border border-gray-200 object-contain"
                                    />
                                ) : (
                                    <div className="h-28 w-28 rounded-lg bg-gray-100" />
                                )}

                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">
                                        {produtoEdicao.nome}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Código: {produtoEdicao.codigoBarras}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={consultarDadosSI5Edicao}
                                        disabled={consultandoSI5Edicao}
                                        className="mt-3 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                                    >
                                        {consultandoSI5Edicao
                                            ? "Consultando SI5..."
                                            : "Consultar dados na SI5"}
                                    </button>
                                </div>
                            </div>

                            {produtoExternoEdicao && (
                                <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <div>
                                        <h3 className="font-semibold text-blue-900">
                                            Dados encontrados na SI5
                                        </h3>
                                        <p className="mt-1 text-sm text-blue-800">
                                            Confira os dados. Eles só serão
                                            transferidos para o formulário
                                            quando você clicar em aplicar.
                                        </p>
                                    </div>

                                    {produtoExternoEdicao.imagemUrl && (
                                        <img
                                            src={produtoExternoEdicao.imagemUrl}
                                            alt={produtoExternoEdicao.nome || "Imagem externa do produto"}
                                            className="h-28 w-28 rounded-lg border border-blue-200 bg-white object-contain"
                                        />
                                    )}

                                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                        <div>
                                            <dt className="text-blue-700">
                                                Nome
                                            </dt>
                                            <dd className="font-medium text-blue-950">
                                                {produtoExternoEdicao.nome || "Não informado"}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt className="text-blue-700">
                                                Marca
                                            </dt>
                                            <dd className="font-medium text-blue-950">
                                                {produtoExternoEdicao.marca || "Não informada"}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt className="text-blue-700">
                                                Categoria
                                            </dt>
                                            <dd className="font-medium text-blue-950">
                                                {produtoExternoEdicao.categoria || "Não informada"}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt className="text-blue-700">
                                                URL da imagem
                                            </dt>
                                            <dd className="break-all font-medium text-blue-950">
                                                {produtoExternoEdicao.imagemUrl || "Não informada"}
                                            </dd>
                                        </div>
                                    </dl>

                                    <button
                                        type="button"
                                        onClick={aplicarDadosSI5NaEdicao}
                                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        Aplicar dados da SI5
                                    </button>
                                </div>
                            )}

                            <form
                                onSubmit={salvarEdicaoProduto}
                                className="space-y-4"
                            >
                                <h3 className="font-semibold text-gray-900">
                                    Formulário de edição
                                </h3>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <CampoFormulario
                                        label="Nome"
                                        value={dadosEdicao.nome}
                                        onChange={(event) =>
                                            atualizarCampoEdicao(
                                                "nome",
                                                event.target.value
                                            )
                                        }
                                        required
                                    />

                                    <CampoFormulario
                                        label="Código de barras"
                                        value={dadosEdicao.codigoBarras}
                                        onChange={(event) =>
                                            atualizarCampoEdicao(
                                                "codigoBarras",
                                                event.target.value
                                            )
                                        }
                                    />

                                    <CampoFormulario
                                        label="Marca"
                                        value={dadosEdicao.marca}
                                        onChange={(event) =>
                                            atualizarCampoEdicao(
                                                "marca",
                                                event.target.value
                                            )
                                        }
                                    />

                                    <CampoFormulario
                                        label="Categoria"
                                        value={dadosEdicao.categoria}
                                        onChange={(event) =>
                                            atualizarCampoEdicao(
                                                "categoria",
                                                event.target.value
                                            )
                                        }
                                    />

                                    <CampoFormulario
                                        label="URL da imagem"
                                        value={dadosEdicao.imagemUrl}
                                        onChange={(event) =>
                                            atualizarCampoEdicao(
                                                "imagemUrl",
                                                event.target.value
                                            )
                                        }
                                    />

                                    <CampoFormulario
                                        label="Preço de custo (R$)"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={dadosEdicao.precoCusto}
                                        onChange={(event) =>
                                            atualizarCampoEdicao(
                                                "precoCusto",
                                                event.target.value
                                            )
                                        }
                                        required
                                    />

                                    <CampoFormulario
                                        label="Preço de venda (R$)"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={dadosEdicao.precoVenda}
                                        onChange={(event) =>
                                            atualizarCampoEdicao(
                                                "precoVenda",
                                                event.target.value
                                            )
                                        }
                                        required
                                    />

                                    <CampoFormulario
                                        label="Quantidade em estoque"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={dadosEdicao.quantidadeEstoque}
                                        onChange={(event) =>
                                            atualizarCampoEdicao(
                                                "quantidadeEstoque",
                                                event.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={salvandoEdicao}
                                    className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    {salvandoEdicao
                                        ? "Salvando..."
                                        : "Salvar alterações"}
                                </button>
                            </form>
                        </div>
                    )}
                </section>
            )}

            {secaoAtual === "exclusao" && (
                <section className="max-w-3xl space-y-5">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Excluir produto
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Selecione um produto cadastrado para revisar e
                            confirmar a exclusão.
                        </p>
                    </div>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-gray-700">
                            Produto
                        </span>

                        <select
                            value={produtoExclusao?.id ?? ""}
                            onChange={(event) =>
                                selecionarProdutoExclusao(event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
                        >
                            <option value="">Selecione um produto</option>

                            {produtos
                                .filter((produto) => produto.codigoBarras)
                                .map((produto) => (
                                    <option
                                        key={produto.id}
                                        value={produto.id}
                                    >
                                        {produto.nome} — {produto.codigoBarras}
                                    </option>
                                ))}
                        </select>
                    </label>

                    <Mensagem tipo={tipoMensagemExclusao}>
                        {mensagemExclusao}
                    </Mensagem>

                    {produtoExclusao && (
                        <div className="space-y-4 rounded-xl border border-gray-200 p-5">
                            <div className="flex items-center gap-4">
                                {produtoExclusao.imagemUrl ? (
                                    <img
                                        src={produtoExclusao.imagemUrl}
                                        alt={produtoExclusao.nome}
                                        className="h-20 w-20 rounded-lg border border-gray-200 object-contain"
                                    />
                                ) : (
                                    <div className="h-20 w-20 rounded-lg bg-gray-100" />
                                )}

                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {produtoExclusao.nome}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Código: {produtoExclusao.codigoBarras}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Preço: {formatarMoeda(
                                            produtoExclusao.precoVendaCentavos
                                        )}
                                    </p>
                                </div>
                            </div>

                            {!confirmarExclusao ? (
                                <button
                                    type="button"
                                    onClick={() => setConfirmarExclusao(true)}
                                    className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    Excluir produto
                                </button>
                            ) : (
                                <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
                                    <p className="text-sm text-red-800">
                                        Confirma a exclusão de{" "}
                                        <strong>{produtoExclusao.nome}</strong>?
                                        Essa ação não poderá ser desfeita.
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={confirmarExclusaoProduto}
                                            disabled={carregandoExclusao}
                                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {carregandoExclusao
                                                ? "Excluindo..."
                                                : "Confirmar exclusão"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setConfirmarExclusao(false)
                                            }
                                            disabled={carregandoExclusao}
                                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}

export default Produtos;
