import {
    SECOES,
    formatarMoeda
} from "../utils/produtosUtils";

import useProdutos from "../hooks/useProdutos";
import ListagemProdutos from "../components/ListagemProdutos";
import CadastroProduto from "../components/CadastroProduto";
import EdicaoProduto from "../components/EdicaoProduto";
import ExclusaoProduto from "../components/ExclusaoProduto";

function Produtos() {
    const {
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
    } = useProdutos();

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
                <ListagemProdutos
                    pesquisa={pesquisa}
                    setPesquisa={setPesquisa}
                    filtroCategoria={filtroCategoria}
                    setFiltroCategoria={setFiltroCategoria}
                    categorias={categorias}
                    carregarProdutos={carregarProdutos}
                    carregandoLista={carregandoLista}
                    erroLista={erroLista}
                    produtosFiltrados={produtosFiltrados}
                    produtosExibidos={produtosExibidos}
                    mostrarTodos={mostrarTodos}
                    setMostrarTodos={setMostrarTodos}
                    formatarMoeda={formatarMoeda}
                />
            )}

            {secaoAtual === "cadastro" && (
            <CadastroProduto
                codigoBarrasCadastro={codigoBarrasCadastro}
                setCodigoBarrasCadastro={setCodigoBarrasCadastro}
                consultarProdutoCadastro={consultarProdutoCadastro}
                carregandoCadastro={carregandoCadastro}
                mensagemCadastro={mensagemCadastro}
                tipoMensagemCadastro={tipoMensagemCadastro}
                produtoExternoCadastro={produtoExternoCadastro}
                dadosCadastro={dadosCadastro}
                atualizarCampoCadastro={atualizarCampoCadastro}
                salvarCadastroProduto={salvarCadastroProduto}
            />
        )}

            {secaoAtual === "edicao" && (
            <EdicaoProduto
                codigoBarrasEdicao={codigoBarrasEdicao}
                setCodigoBarrasEdicao={setCodigoBarrasEdicao}
                consultarProdutoEdicao={consultarProdutoEdicao}
                carregandoEdicao={carregandoEdicao}
                mensagemEdicao={mensagemEdicao}
                tipoMensagemEdicao={tipoMensagemEdicao}
                produtoEdicao={produtoEdicao}
                dadosEdicao={dadosEdicao}
                produtoExternoEdicao={produtoExternoEdicao}
                consultandoSI5Edicao={consultandoSI5Edicao}
                consultarDadosSI5Edicao={consultarDadosSI5Edicao}
                aplicarDadosSI5NaEdicao={aplicarDadosSI5NaEdicao}
                atualizarCampoEdicao={atualizarCampoEdicao}
                salvarEdicaoProduto={salvarEdicaoProduto}
                salvandoEdicao={salvandoEdicao}
            />
        )}

            {secaoAtual === "exclusao" && (
                <ExclusaoProduto
                    produtos={produtos}
                    produtoExclusao={produtoExclusao}
                    selecionarProdutoExclusao={selecionarProdutoExclusao}
                    confirmarExclusao={confirmarExclusao}
                    setConfirmarExclusao={setConfirmarExclusao}
                    carregandoExclusao={carregandoExclusao}
                    mensagemExclusao={mensagemExclusao}
                    tipoMensagemExclusao={tipoMensagemExclusao}
                    confirmarExclusaoProduto={confirmarExclusaoProduto}
                    formatarMoeda={formatarMoeda}
                />
            )}
        </main>
    );
}

export default Produtos;
