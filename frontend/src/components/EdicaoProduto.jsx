import CampoFormulario from "./CampoFormulario";
import Mensagem from "./Mensagem";

function EdicaoProduto({
    codigoBarrasEdicao,
    setCodigoBarrasEdicao,
    consultarProdutoEdicao,
    carregandoEdicao,
    mensagemEdicao,
    tipoMensagemEdicao,
    produtoEdicao,
    dadosEdicao,
    produtoExternoEdicao,
    consultandoSI5Edicao,
    consultarDadosSI5Edicao,
    aplicarDadosSI5NaEdicao,
    atualizarCampoEdicao,
    salvarEdicaoProduto,
    salvandoEdicao
}) {
    return (
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
                                    alt={
                                        produtoExternoEdicao.nome ||
                                        "Imagem externa do produto"
                                    }
                                    className="h-28 w-28 rounded-lg border border-blue-200 bg-white object-contain"
                                />
                            )}

                            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                <div>
                                    <dt className="text-blue-700">
                                        Nome
                                    </dt>
                                    <dd className="font-medium text-blue-950">
                                        {produtoExternoEdicao.nome ||
                                            "Não informado"}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-blue-700">
                                        Marca
                                    </dt>
                                    <dd className="font-medium text-blue-950">
                                        {produtoExternoEdicao.marca ||
                                            "Não informada"}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-blue-700">
                                        Categoria
                                    </dt>
                                    <dd className="font-medium text-blue-950">
                                        {produtoExternoEdicao.categoria ||
                                            "Não informada"}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-blue-700">
                                        URL da imagem
                                    </dt>
                                    <dd className="break-all font-medium text-blue-950">
                                        {produtoExternoEdicao.imagemUrl ||
                                            "Não informada"}
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
    );
}

export default EdicaoProduto;
