import Mensagem from "./Mensagem";

function ExclusaoProduto({
    produtos,
    produtoExclusao,
    selecionarProdutoExclusao,
    confirmarExclusao,
    setConfirmarExclusao,
    carregandoExclusao,
    mensagemExclusao,
    tipoMensagemExclusao,
    confirmarExclusaoProduto,
    formatarMoeda
}) {
    return (
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
                                Preço:{" "}
                                {formatarMoeda(
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
    );
}

export default ExclusaoProduto;
