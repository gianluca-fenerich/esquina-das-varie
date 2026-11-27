import { supabase } from "../config/supabaseClient.js";

function mapearCliente(cliente) {
    if (!cliente) {
        return null;
    }

    return {
        id: cliente.id,
        nome: cliente.nome,
        ativo: cliente.ativo,
        compraPrazoAutorizada: cliente.compra_prazo_autorizada,
        criadoEm: cliente.criado_em
    };
}

export async function listarClientes() {
    const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome", { ascending: true });

    if (error) {
        throw error;
    }

    return data.map(mapearCliente);
}

export async function cadastrarCliente(dados) {
    const { data, error } = await supabase
        .from("clientes")
        .insert({
            nome: dados.nome.trim(),
            ativo: true,
            compra_prazo_autorizada: false
        })
        .select("*")
        .single();

    if (error) {
        throw error;
    }

    return mapearCliente(data);
}

export async function atualizarCliente(id, dados) {
    const atualizacoes = {};

    if (dados.nome !== undefined) {
        atualizacoes.nome = dados.nome.trim();
    }

    if (dados.ativo !== undefined) {
        atualizacoes.ativo = dados.ativo;
    }

    if (dados.compraPrazoAutorizada !== undefined) {
        atualizacoes.compra_prazo_autorizada =
            dados.compraPrazoAutorizada;
    }

    const { data, error } = await supabase
        .from("clientes")
        .update(atualizacoes)
        .eq("id", id)
        .select("*")
        .maybeSingle();

    if (error) {
        throw error;
    }

    return mapearCliente(data);
}
