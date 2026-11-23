import { useState } from "react";

import {
    buscarProdutoPorCodigoBarras,
    consultarProdutoExterno,
    cadastrarProduto
} from "../services/produtosService";

function Produtos() {
    const [codigoBarras, setCodigoBarras] = useState("");

    const [produto, setProduto] = useState(null);
    const [dadosExternos, setDadosExternos] = useState(null);

    const [mensagemErro, setMensagemErro] = useState("");
    const [mensagemSucesso, setMensagemSucesso] = useState("");

    const [carregando, setCarregando] = useState(false);
    const [produtoNaoEncontrado, setProdutoNaoEncontrado] = useState(false);

    const [dadosCadastro, setDadosCadastro] = useState({
        nome: "",
        codigoBarras: "",
        marca: "",
        categoria: "",
        imagemUrl: ""
    });

    const [precoCusto, setPrecoCusto] = useState("");
    const [precoVenda, setPrecoVenda] = useState("");
    const [quantidadeEstoque, setQuantidadeEstoque] = useState("");

    async function consultarProduto() {
        if (!codigoBarras.trim()) {
            setMensagemErro("Informe um código de barras.");
            return;
        }

        setCarregando(true);
        setMensagemErro("");
        setMensagemSucesso("");
        setProduto(null);
        setDadosExternos(null);
        setProdutoNaoEncontrado(false);

        try {
            const dados = await buscarProdutoPorCodigoBarras(codigoBarras);

            setProduto(dados);
        } catch (erro) {
            if (erro.message === "Produto não encontrado.") {
                setProdutoNaoEncontrado(true);
            } else {
                setMensagemErro(erro.message);
            }
        } finally {
            setCarregando(false);
        }
    }

    async function consultarDadosExternos() {
        setCarregando(true);
        setMensagemErro("");
        setMensagemSucesso("");
        setProdutoNaoEncontrado(false);

        try {
            const dados = await consultarProdutoExterno(codigoBarras);

            setDadosExternos(dados);

            setDadosCadastro({
                nome: dados.nome || "",
                codigoBarras: dados.codigoBarras || "",
                marca: dados.marca || "",
                categoria: dados.categoria || "",
                imagemUrl: dados.imagemUrl || ""
            });

        } catch (erro) {
            setMensagemErro(erro.message);
        } finally {
            setCarregando(false);
        }
    }

    function atualizarDadosCadastro(evento) {
        const { name, value } = evento.target;

        setDadosCadastro((dadosAnteriores) => ({
            ...dadosAnteriores,
            [name]: value
        }));
    }

    async function cadastrarNovoProduto(evento) {
        evento.preventDefault();

        setMensagemErro("");
        setMensagemSucesso("");

        if (
            !dadosCadastro.nome.trim() ||
            !dadosCadastro.codigoBarras.trim()
        ) {
            setMensagemErro("Nome e código de barras são obrigatórios.");
            return;
        }

        if (
            precoCusto.trim() === "" ||
            precoVenda.trim() === "" ||
            quantidadeEstoque.trim() === ""
        ) {
            setMensagemErro("Preencha todos os dados comerciais.");
            return;
        }

        const custo = Number(precoCusto);
        const venda = Number(precoVenda);
        const estoque = Number(quantidadeEstoque);

        if (
            !Number.isFinite(custo) ||
            !Number.isFinite(venda) ||
            custo < 0 ||
            venda < 0
        ) {
            setMensagemErro("Informe preços válidos.");
            return;
        }

        if (
            !Number.isSafeInteger(Math.round(custo * 100)) ||
            !Number.isSafeInteger(Math.round(venda * 100))
        ) {
            setMensagemErro("Os valores informados são muito altos.");
            return;
        }

        if (!Number.isSafeInteger(estoque) || estoque < 0) {
            setMensagemErro("Informe uma quantidade inteira válida para o estoque.");
            return;
        }

        const dadosProduto = {
            nome: dadosCadastro.nome.trim(),
            codigoBarras: dadosCadastro.codigoBarras.trim(),
            marca: dadosCadastro.marca.trim() || null,
            categoria: dadosCadastro.categoria.trim() || null,
            imagemUrl: dadosCadastro.imagemUrl || null,
            precoCustoCentavos: Math.round(custo * 100),
            precoVendaCentavos: Math.round(venda * 100),
            quantidadeEstoque: estoque
        };

        setCarregando(true);

        try {
            const produtoCriado = await cadastrarProduto(dadosProduto);

            setProduto(produtoCriado);
            setDadosExternos(null);

            setPrecoCusto("");
            setPrecoVenda("");
            setQuantidadeEstoque("");

            setMensagemSucesso("Produto cadastrado com sucesso!");

        } catch (erro) {
            setMensagemErro(erro.message);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main>
            <header>
                <h1>Produtos</h1>
                <p>Cadastre, consulte e gerencie os produtos da loja.</p>
            </header>

            <section>
                <h2>Consultar produto</h2>

                <label htmlFor="codigoBarras">
                    Código de barras
                </label>

                <input
                    type="text"
                    id="codigoBarras"
                    value={codigoBarras}
                    onChange={(evento) => setCodigoBarras(evento.target.value)}
                    placeholder="Digite ou escaneie o código de barras"
                />

                <button
                    type="button"
                    onClick={consultarProduto}
                    disabled={carregando}
                >
                    {carregando ? "Consultando..." : "Consultar"}
                </button>
            </section>

            {mensagemErro && (
                <p>{mensagemErro}</p>
            )}

            {mensagemSucesso && (
                <p>{mensagemSucesso}</p>
            )}

            {produtoNaoEncontrado && (
                <section>
                    <p>Produto não encontrado no banco de dados.</p>

                    <button
                        type="button"
                        onClick={consultarDadosExternos}
                        disabled={carregando}
                    >
                        {carregando ? "Consultando..." : "Consultar na SI5"}
                    </button>
                </section>
            )}

            {produto && (
                <section>
                    <h2>Produto encontrado no banco de dados</h2>

                    <p>Nome: {produto.nome}</p>
                    <p>Código de barras: {produto.codigoBarras}</p>
                    <p>Marca: {produto.marca || "Não informada"}</p>
                    <p>Categoria: {produto.categoria || "Não informada"}</p>
                </section>
            )}

            {dadosExternos && (
                <>
                    <section>
                        <h2>Dados encontrados na SI5</h2>

                        {dadosExternos.imagemUrl && (
                            <img
                                src={dadosExternos.imagemUrl}
                                alt={`Imagem de ${dadosExternos.nome}`}
                                width="180"
                            />
                        )}

                        <p>Nome: {dadosExternos.nome}</p>

                        <p>
                            Código de barras: {dadosExternos.codigoBarras}
                        </p>

                        <p>
                            Marca: {dadosExternos.marca || "Não informada"}
                        </p>

                        <p>
                            Categoria: {dadosExternos.categoria || "Não informada"}
                        </p>

                        <p>Situação: Aguardando cadastro</p>
                    </section>

                    <section>
                        <h2>Cadastrar produto</h2>

                        <form onSubmit={cadastrarNovoProduto}>
                            <h3>Dados do produto</h3>

                            <label htmlFor="nome">Nome</label>
                            <input
                                id="nome"
                                name="nome"
                                type="text"
                                value={dadosCadastro.nome}
                                onChange={atualizarDadosCadastro}
                            />

                            <label htmlFor="codigoBarrasCadastro">
                                Código de barras
                            </label>

                            <input
                                id="codigoBarrasCadastro"
                                name="codigoBarras"
                                type="text"
                                value={dadosCadastro.codigoBarras}
                                onChange={atualizarDadosCadastro}
                            />

                            <label htmlFor="marca">Marca</label>
                            <input
                                id="marca"
                                name="marca"
                                type="text"
                                value={dadosCadastro.marca}
                                onChange={atualizarDadosCadastro}
                            />

                            <label htmlFor="categoria">Categoria</label>
                            <input
                                id="categoria"
                                name="categoria"
                                type="text"
                                value={dadosCadastro.categoria}
                                onChange={atualizarDadosCadastro}
                            />

                            <h3>Dados comerciais</h3>

                            <label htmlFor="precoCusto">
                                Preço de custo (R$)
                            </label>

                            <input
                                id="precoCusto"
                                type="number"
                                min="0"
                                step="0.01"
                                value={precoCusto}
                                onChange={(evento) => setPrecoCusto(evento.target.value)}
                            />

                            <label htmlFor="precoVenda">
                                Preço de venda (R$)
                            </label>

                            <input
                                id="precoVenda"
                                type="number"
                                min="0"
                                step="0.01"
                                value={precoVenda}
                                onChange={(evento) => setPrecoVenda(evento.target.value)}
                            />

                            <label htmlFor="quantidadeEstoque">
                                Quantidade em estoque
                            </label>

                            <input
                                id="quantidadeEstoque"
                                type="number"
                                min="0"
                                step="1"
                                value={quantidadeEstoque}
                                onChange={(evento) =>
                                    setQuantidadeEstoque(evento.target.value)
                                }
                            />

                            <button type="submit" disabled={carregando}>
                                {carregando ? "Cadastrando..." : "Cadastrar produto"}
                            </button>
                        </form>
                    </section>
                </>
            )}
        </main>
    );
}

export default Produtos;
