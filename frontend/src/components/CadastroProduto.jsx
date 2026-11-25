import CampoFormulario from "./CampoFormulario";
import Mensagem from "./Mensagem";

function CadastroProduto({
    codigoBarrasCadastro,
    setCodigoBarrasCadastro,
    consultarProdutoCadastro,
    carregandoCadastro,
    mensagemCadastro,
    tipoMensagemCadastro,
    produtoExternoCadastro,
    dadosCadastro,
    atualizarCampoCadastro,
    salvarCadastroProduto
}) {
    return (
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
    );
}

export default CadastroProduto;
