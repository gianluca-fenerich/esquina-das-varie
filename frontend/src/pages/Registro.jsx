import { useEffect, useState } from "react";

import { listarVendasPorData } from "../services/vendasService";

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
});

const formatadorHorario = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
});

const formatadorData = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
});

const formasPagamento = {
    dinheiro: "Dinheiro",
    pix: "Pix",
    cartao: "Cartão"
};

function obterDataAtual() {
    const data = new Date();

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
    return formatadorData.format(new Date(`${data}T12:00:00`));
}

function Registro() {
    const [dataSelecionada, setDataSelecionada] = useState(obterDataAtual);
    const [vendas, setVendas] = useState([]);
    const [vendaSelecionadaId, setVendaSelecionadaId] = useState(null);

    const [isCarregando, setIsCarregando] = useState(true);
    const [mensagemErro, setMensagemErro] = useState("");

    useEffect(() => {
        let consultaAtiva = true;

        async function carregarVendas() {
            setIsCarregando(true);
            setMensagemErro("");
            setVendas([]);
            setVendaSelecionadaId(null);

            try {
                const dados = await listarVendasPorData(dataSelecionada);

                if (!consultaAtiva) {
                    return;
                }

                setVendas(dados);

                if (dados.length > 0) {
                    setVendaSelecionadaId(dados[0].id);
                }
            } catch (error) {
                if (!consultaAtiva) {
                    return;
                }

                console.error("Erro ao consultar vendas:", error);

                setMensagemErro(
                    error.message || "Erro ao consultar histórico de vendas."
                );
            } finally {
                if (consultaAtiva) {
                    setIsCarregando(false);
                }
            }
        }

        carregarVendas();

        return () => {
            consultaAtiva = false;
        };
    }, [dataSelecionada]);

    const vendaSelecionada = vendas.find(
        (venda) => venda.id === vendaSelecionadaId
    );

    const totalVendidoCentavos = vendas.reduce(
        (total, venda) => total + venda.totalCentavos,
        0
    );

    return (
        <main className="min-h-screen bg-slate-100 text-slate-900">
            <header className="border-b border-slate-200 bg-white px-8 py-5">
                <div className="mx-auto max-w-7xl">
                    <h1 className="text-2xl font-bold">
                        Esquina das Variedades
                    </h1>

                    <p className="text-sm text-slate-500">
                        Registro de vendas
                    </p>
                </div>
            </header>

            <div className="mx-auto max-w-7xl space-y-6 p-8">
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Histórico de vendas
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Consulte as vendas realizadas em uma data.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="dataRegistro"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Data das vendas
                            </label>

                            <input
                                id="dataRegistro"
                                type="date"
                                value={dataSelecionada}
                                onChange={(event) =>
                                    setDataSelecionada(event.target.value)
                                }
                                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Vendas realizadas
                        </p>

                        <p className="mt-3 text-3xl font-bold">
                            {isCarregando ? "—" : vendas.length}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                            {formatarData(dataSelecionada)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Total vendido
                        </p>

                        <p className="mt-3 text-3xl font-bold text-emerald-700">
                            {isCarregando
                                ? "—"
                                : formatadorMoeda.format(
                                      totalVendidoCentavos / 100
                                  )}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                            Valor total das vendas registradas
                        </p>
                    </div>
                </section>

                {mensagemErro && (
                    <p
                        role="alert"
                        className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                    >
                        {mensagemErro}
                    </p>
                )}

                <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-5">
                            <h2 className="text-lg font-semibold">
                                Vendas do dia
                            </h2>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {isCarregando ? (
                                <p className="p-6 text-sm text-slate-500">
                                    Carregando vendas...
                                </p>
                            ) : mensagemErro ? (
                                <p className="p-6 text-sm text-slate-500">
                                    Não foi possível carregar as vendas.
                                </p>
                            ) : vendas.length === 0 ? (
                                <p className="p-6 text-sm text-slate-500">
                                    Nenhuma venda encontrada nesta data.
                                </p>
                            ) : (
                                vendas.map((venda) => {
                                    const selecionada =
                                        venda.id === vendaSelecionadaId;

                                    return (
                                        <button
                                            key={venda.id}
                                            type="button"
                                            onClick={() =>
                                                setVendaSelecionadaId(venda.id)
                                            }
                                            className={`w-full px-6 py-5 text-left transition ${
                                                selecionada
                                                    ? "bg-blue-50"
                                                    : "hover:bg-slate-50"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-semibold">
                                                        Venda #{venda.id}
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {formatadorHorario.format(
                                                            new Date(
                                                                venda.dataVenda
                                                            )
                                                        )}
                                                        {" · "}
                                                        {formasPagamento[
                                                            venda.formaPagamento
                                                        ] ||
                                                            venda.formaPagamento}
                                                    </p>
                                                </div>

                                                <p className="font-semibold">
                                                    {formatadorMoeda.format(
                                                        venda.totalCentavos / 100
                                                    )}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-5">
                            <h2 className="text-lg font-semibold">
                                Detalhes da venda
                            </h2>
                        </div>

                        {!vendaSelecionada ? (
                            <p className="p-6 text-sm text-slate-500">
                                {isCarregando
                                    ? "Carregando detalhes..."
                                    : "Selecione uma venda para consultar seus produtos."}
                            </p>
                        ) : (
                            <div className="p-6">
                                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-lg font-semibold">
                                            Venda #{vendaSelecionada.id}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {formatadorHorario.format(
                                                new Date(
                                                    vendaSelecionada.dataVenda
                                                )
                                            )}
                                        </p>
                                    </div>

                                    <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
                                        {formasPagamento[
                                            vendaSelecionada.formaPagamento
                                        ] ||
                                            vendaSelecionada.formaPagamento}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {vendaSelecionada.itens.map((item) => (
                                        <div
                                            key={item.id}
                                            className="border-b border-slate-100 pb-4"
                                        >
                                            <div className="flex justify-between gap-4">
                                                <p className="font-medium">
                                                    {item.nome}
                                                </p>

                                                <p className="shrink-0 font-semibold">
                                                    {formatadorMoeda.format(
                                                        item.subtotalCentavos /
                                                            100
                                                    )}
                                                </p>
                                            </div>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {item.quantidade} ×{" "}
                                                {formatadorMoeda.format(
                                                    item.precoUnitarioCentavos /
                                                        100
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                    <span className="font-semibold">
                                        Total da venda
                                    </span>

                                    <span className="text-2xl font-bold">
                                        {formatadorMoeda.format(
                                            vendaSelecionada.totalCentavos /
                                                100
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Registro;
