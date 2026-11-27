function ProdutosVenda({
    carrinho,
    aumentarQuantidade,
    diminuirQuantidade,
    removerProduto,
    formatadorMoeda
}) {
    if (carrinho.length === 0) {
        return (
            <div className="flex min-h-60 items-center justify-center">
                <div className="text-center">
                    <p className="font-medium text-slate-500">
                        Nenhum produto adicionado
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Escaneie um código de barras para começar a venda.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {carrinho.map((produto) => {
                const subtotalCentavos =
                    produto.precoVendaCentavos * produto.quantidade;

                const estoqueInsuficiente =
                    produto.quantidade >= produto.quantidadeEstoque;

                return (
                    <article
                        key={produto.id}
                        className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            {produto.imagemUrl ? (
                                <img
                                    src={produto.imagemUrl}
                                    alt={produto.nome}
                                    className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1"
                                />
                            ) : (
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                                    Sem imagem
                                </div>
                            )}

                            <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">
                                    {produto.nome}
                                </p>

                                {produto.marca && (
                                    <p className="text-sm text-slate-500">
                                        {produto.marca}
                                    </p>
                                )}

                                <p className="text-xs text-slate-400">
                                    Código: {produto.codigoBarras || "—"}
                                </p>

                                <p className="mt-1 text-sm text-slate-600">
                                    {formatadorMoeda.format(
                                        produto.precoVendaCentavos / 100
                                    )}{" "}
                                    por unidade
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => diminuirQuantidade(produto.id)}
                                    className="h-9 w-9 rounded-lg border border-slate-300 font-semibold hover:bg-slate-100"
                                    aria-label={`Diminuir quantidade de ${produto.nome}`}
                                >
                                    −
                                </button>

                                <span className="min-w-8 text-center font-semibold tabular-nums">
                                    {produto.quantidade}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => aumentarQuantidade(produto.id)}
                                    disabled={estoqueInsuficiente}
                                    className="h-9 w-9 rounded-lg border border-slate-300 font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label={`Aumentar quantidade de ${produto.nome}`}
                                >
                                    +
                                </button>
                            </div>

                            <div className="min-w-24 text-right">
                                <p className="font-semibold text-slate-900">
                                    {formatadorMoeda.format(
                                        subtotalCentavos / 100
                                    )}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => removerProduto(produto.id)}
                                    className="mt-1 text-xs font-medium text-red-600 hover:text-red-700"
                                >
                                    Remover
                                </button>
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

export default ProdutosVenda;
