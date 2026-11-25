import Mensagem from "./Mensagem";

function ListagemProdutos({
    pesquisa,
    setPesquisa,
    filtroCategoria,
    setFiltroCategoria,
    categorias,
    carregarProdutos,
    carregandoLista,
    erroLista,
    produtosFiltrados,
    produtosExibidos,
    mostrarTodos,
    setMostrarTodos,
    formatarMoeda
}) {
    return (
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
    );
}

export default ListagemProdutos;
