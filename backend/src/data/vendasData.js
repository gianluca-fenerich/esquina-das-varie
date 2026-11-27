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
