import { supabase } from "../config/supabaseClient.js";

function mapearProduto(produto) {
    if (!produto) {
        return null;
    }

    return {
        id: produto.id,
        nome: produto.nome,
        codigoBarras: produto.codigo_barras,
        marca: produto.marca,
        categoria: produto.categoria,
        imagemUrl: produto.imagem_url,
        precoCustoCentavos: produto.preco_custo_centavos,
        precoVendaCentavos: produto.preco_venda_centavos,
        quantidadeEstoque: produto.quantidade_estoque
    };
}

export async function listarProdutos() {
    const { data, error } = await supabase
        .from('produtos')
        .select('*');

        if (error) {
            throw error;
        }

        return data.map(mapearProduto);
}

export async function buscarProdutoPorId(id) {
    const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
        .maybeSingle();

        if (error) {
            throw error;
        }

        return mapearProduto(data);
}

export async function buscarProdutoPorCodigoBarras(codigoBarras) {
    const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('codigo_barras', codigoBarras)
        .maybeSingle();

        if (error) {
            throw error;
        }

        return mapearProduto(data);
}

export async function cadastrarProduto(dados) {
    const { data, error } = await supabase
        .from('produtos')
        .insert({
            nome: dados.nome.trim(),
            codigo_barras: dados.codigoBarras?.trim() || null,
            marca: dados.marca ?? null,
            categoria: dados.categoria ?? null,
            imagem_url: dados.imagemUrl ?? null,
            preco_custo_centavos: dados.precoCustoCentavos ?? null,
            preco_venda_centavos: dados.precoVendaCentavos ?? null,
            quantidade_estoque: dados.quantidadeEstoque ?? null

        })
        .select('*')
        .single();

        if (error) {
            throw error;
        }

        return mapearProduto(data);
}

export async function atualizarProduto(id, dados) {
    const { data, error } = await supabase
        .from('produtos')
        .update({
            nome: dados.nome.trim(),
            codigo_barras: dados.codigoBarras?.trim() || null,
            marca: dados.marca ?? null,
            categoria: dados.categoria ?? null,
            imagem_url: dados.imagemUrl ?? null,
            preco_custo_centavos: dados.precoCustoCentavos ?? null,
            preco_venda_centavos: dados.precoVendaCentavos ?? null,
            quantidade_estoque: dados.quantidadeEstoque ?? null
        })
        .eq('id', id)
        .select()
        .maybeSingle();

        if (error) {
            throw error;
        }

        return mapearProduto(data);
}

export async function deletarProduto(id) {
    const { data, error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id)
        .select('*')
        .maybeSingle();

        if (error) {
            throw error;
        }

        return mapearProduto(data);
}