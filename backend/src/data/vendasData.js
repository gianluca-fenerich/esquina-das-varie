import { supabase } from "../config/supabaseClient.js";

export async function finalizarVenda(dados) {
    const { data, error } = await supabase.rpc("finalizar_venda", {
        p_itens: dados.itens,
        p_forma_pagamento: dados.formaPagamento
    });

    if (error) {
        throw error;
    }

    return data;
}

export async function listarVendasPorData(dataInicio, dataFim) {
    const { data, error } = await supabase
        .from("vendas")
        .select(`
            id,
            data_venda,
            forma_pagamento,
            total_centavos,
            vendas_itens (
                id,
                produto_id,
                nome_produto,
                preco_unitario_centavos,
                quantidade,
                subtotal_centavos
            )
        `)
        .gte("data_venda", dataInicio)
        .lt("data_venda", dataFim)
        .order("data_venda", { ascending: false });

    if (error) {
        throw error;
    }

    return data.map((venda) => ({
        id: venda.id,
        dataVenda: venda.data_venda,
        formaPagamento: venda.forma_pagamento,
        totalCentavos: venda.total_centavos,
        itens: venda.vendas_itens.map((item) => ({
            id: item.id,
            produtoId: item.produto_id,
            nome: item.nome_produto,
            precoUnitarioCentavos: item.preco_unitario_centavos,
            quantidade: item.quantidade,
            subtotalCentavos: item.subtotal_centavos
        }))
    }));
}