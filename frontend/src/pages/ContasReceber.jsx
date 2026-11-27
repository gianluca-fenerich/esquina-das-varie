import { useEffect, useState } from "react";

import {
    listarContasReceber,
    registrarRecebimento
} from "../services/contasReceberService";

const FORMAS_PAGAMENTO = [
    { valor: "dinheiro", texto: "Dinheiro" },
    { valor: "pix", texto: "Pix" },
    { valor: "cartao", texto: "Cartão" }
];

const SITUACOES = {
    pendente: "Pendente",
    parcial: "Parcial",
    vencida: "Vencida",
    paga: "Paga"
};

function formatarMoeda(valorCentavos) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(valorCentavos / 100);
}

function formatarData(data) {
    if (!data) {
        return "-";
    }

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
}

function formatarDataVenda(data) {
    if (!data) {
        return "-";
    }

    return new Date(data).toLocaleDateString("pt-BR");
}

function ContasReceber() {
    const [contas, setContas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [contaEmProcessamento, setContaEmProcessamento] = useState(null);

    const [formularios, setFormularios] = useState({});

    async function carregarContas() {
        setErro("");

        try {
            const dados = await listarContasReceber();

            setContas(dados);
        } catch (error) {
            setErro(error.message);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarContas();
    }, []);

    function atualizarFormulario(contaId, campo, valor) {
        setFormularios((formulariosAtuais) => ({
            ...formulariosAtuais,
            [contaId]: {
                valorCentavos: "",
                formaPagamento: "dinheiro",
                ...formulariosAtuais[contaId],
                [campo]: valor
            }
        }));
    }

    async function handleRegistrarRecebimento(event, conta) {
        event.preventDefault();

        setErro("");
        setMensagem("");

        const formulario = formularios[conta.id] || {
            valorCentavos: "",
            formaPagamento: "dinheiro"
        };

        const valor = Number(formulario.valorCentavos);

        if (!Number.isFinite(valor) || valor <= 0) {
            setErro("Informe um valor de recebimento válido.");
            return;
        }

        const valorEmCentavos = Math.round(valor * 100);

        if (valorEmCentavos > conta.saldoCentavos) {
            setErro("O valor informado é maior que o saldo pendente.");
            return;
        }

        setContaEmProcessamento(conta.id);

        try {
            await registrarRecebimento(conta.id, {
                valorCentavos: valorEmCentavos,
                formaPagamento: formulario.formaPagamento
            });

            setMensagem("Recebimento registrado com sucesso.");

            setFormularios((formulariosAtuais) => ({
                ...formulariosAtuais,
                [conta.id]: {
                    valorCentavos: "",
                    formaPagamento: "dinheiro"
                }
            }));

            await carregarContas();
        } catch (error) {
            setErro(error.message);
        } finally {
            setContaEmProcessamento(null);
        }
    }

    if (carregando) {
        return <p className="p-4">Carregando contas a receber...</p>;
    }

    return (
        <main className="p-4">
            <h1 className="mb-6 text-2xl font-bold">
                Contas a Receber
            </h1>

            {erro && (
                <p className="mb-4 rounded bg-red-100 p-3 text-red-700">
                    {erro}
                </p>
            )}

            {mensagem && (
                <p className="mb-4 rounded bg-green-100 p-3 text-green-700">
                    {mensagem}
                </p>
            )}

            {contas.length === 0 ? (
                <p>Nenhuma conta a receber encontrada.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b bg-gray-100">
                                <th className="p-3">Cliente</th>
                                <th className="p-3">Venda</th>
                                <th className="p-3">Vencimento</th>
                                <th className="p-3">Valor original</th>
                                <th className="p-3">Recebido</th>
                                <th className="p-3">Saldo</th>
                                <th className="p-3">Situação</th>
                                <th className="p-3">Recebimento</th>
                            </tr>
                        </thead>

                        <tbody>
                            {contas.map((conta) => {
                                const formulario = formularios[conta.id] || {
                                    valorCentavos: "",
                                    formaPagamento: "dinheiro"
                                };

                                const processando =
                                    contaEmProcessamento === conta.id;

                                return (
                                    <tr
                                        key={conta.id}
                                        className="border-b align-top"
                                    >
                                        <td className="p-3">
                                            {conta.clienteNome}
                                        </td>

                                        <td className="p-3">
                                            {formatarDataVenda(conta.dataVenda)}
                                        </td>

                                        <td className="p-3">
                                            {formatarData(conta.dataVencimento)}
                                        </td>

                                        <td className="p-3">
                                            {formatarMoeda(
                                                conta.valorOriginalCentavos
                                            )}
                                        </td>

                                        <td className="p-3">
                                            {formatarMoeda(
                                                conta.totalRecebidoCentavos
                                            )}
                                        </td>

                                        <td className="p-3 font-semibold">
                                            {formatarMoeda(
                                                conta.saldoCentavos
                                            )}
                                        </td>

                                        <td className="p-3">
                                            {SITUACOES[conta.situacao] ||
                                                conta.situacao}
                                        </td>

                                        <td className="min-w-64 p-3">
                                            {conta.saldoCentavos === 0 ? (
                                                <span className="text-green-700">
                                                    Conta quitada
                                                </span>
                                            ) : (
                                                <form
                                                    className="flex flex-col gap-2"
                                                    onSubmit={(event) =>
                                                        handleRegistrarRecebimento(
                                                            event,
                                                            conta
                                                        )
                                                    }
                                                >
                                                    <input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        max={
                                                            conta.saldoCentavos /
                                                            100
                                                        }
                                                        placeholder="Valor em R$"
                                                        value={
                                                            formulario.valorCentavos
                                                        }
                                                        onChange={(event) =>
                                                            atualizarFormulario(
                                                                conta.id,
                                                                "valorCentavos",
                                                                event.target.value
                                                            )
                                                        }
                                                        required
                                                        className="w-full rounded border p-2"
                                                    />

                                                    <select
                                                        value={
                                                            formulario.formaPagamento
                                                        }
                                                        onChange={(event) =>
                                                            atualizarFormulario(
                                                                conta.id,
                                                                "formaPagamento",
                                                                event.target.value
                                                            )
                                                        }
                                                        className="w-full rounded border p-2"
                                                    >
                                                        {FORMAS_PAGAMENTO.map(
                                                            (forma) => (
                                                                <option
                                                                    key={
                                                                        forma.valor
                                                                    }
                                                                    value={
                                                                        forma.valor
                                                                    }
                                                                >
                                                                    {
                                                                        forma.texto
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>

                                                    <button
                                                        type="submit"
                                                        disabled={processando}
                                                        className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                                                    >
                                                        {processando
                                                            ? "Registrando..."
                                                            : "Registrar"}
                                                    </button>
                                                </form>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}

export default ContasReceber;
