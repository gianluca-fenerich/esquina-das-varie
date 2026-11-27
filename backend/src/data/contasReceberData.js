import { supabase } from "../config/supabaseClient.js";

function obterDataHojeSaoPaulo() {
    const partes = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(new Date());

    const valores = Object.fromEntries(
        partes.map((parte) => [parte.type, parte.value])
    );

    return `${valores.year}-${valores.month}-${valores.day}`;
}

function calcularSituacaoConta(
    saldoCentavos,
    totalRecebidoCentavos,
    dataVencimento,
    dataHoje
) {
    if (saldoCentavos === 0) {
        return "paga";
    }

    if (dataVencimento < dataHoje) {
        return "vencida";
    }

    if (totalRecebidoCentavos > 0) {
        return "parcial";
    }

    return "pendente";
}

export async function listarContasReceber() {
    const { data, error } = await supabase
        .from("contas_receber")
        .select(`
            id,
            venda_id,
            valor_centavos,
            data_vencimento,
            criado_em,
            venda:vendas (
                id,
                data_venda,
                cliente_id,
                cliente:clientes (
                    id,
                    nome
                )
            ),
            recebimentos (
                id,
                valor_centavos,
                data_recebimento,
                forma_pagamento
            )
        `)
        .order("data_vencimento", {
            ascending: true
        });

    if (error) {
        throw error;
    }

    const dataHoje = obterDataHojeSaoPaulo();

    return data.map((conta) => {
        const venda = conta.venda;
        const cliente = venda?.cliente;

        const recebimentos = conta.recebimentos ?? [];

        const totalRecebidoCentavos = recebimentos.reduce(
            (total, recebimento) => {
                return total + recebimento.valor_centavos;
            },
            0
        );

        const saldoCentavos =
            conta.valor_centavos - totalRecebidoCentavos;

        return {
            id: conta.id,
            vendaId: conta.venda_id,
            clienteId: venda?.cliente_id ?? null,
            clienteNome: cliente?.nome ?? "Cliente não encontrado",
            dataVenda: venda?.data_venda ?? null,
            dataVencimento: conta.data_vencimento,
            valorOriginalCentavos: conta.valor_centavos,
            totalRecebidoCentavos,
            saldoCentavos,
            situacao: calcularSituacaoConta(
                saldoCentavos,
                totalRecebidoCentavos,
                conta.data_vencimento,
                dataHoje
            ),
            recebimentos: recebimentos.map((recebimento) => ({
                id: recebimento.id,
                valorCentavos: recebimento.valor_centavos,
                dataRecebimento: recebimento.data_recebimento,
                formaPagamento: recebimento.forma_pagamento
            }))
        };
    });
}


export async function registrarRecebimento(dados) {
    const { data, error } = await supabase.rpc(
        "registrar_recebimento",
        {
            p_conta_receber_id: dados.contaReceberId,
            p_valor_centavos: dados.valorCentavos,
            p_forma_pagamento: dados.formaPagamento
        }
    );

    if (error) {
        throw error;
    }

    return data;
}
