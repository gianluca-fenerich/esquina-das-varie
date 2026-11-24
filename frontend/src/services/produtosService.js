const API_URL = "http://localhost:3000";

async function requisitarDados(url, mensagemErro, opcoes = {}) {
    const response = await fetch(url, opcoes);

    const texto = await response.text();
    const dados = texto ? JSON.parse(texto) : {};

    if (!response.ok) {
        throw new Error(dados.mensagem || mensagemErro);
    }

    return dados;
}

export async function listarProdutos() {
    return requisitarDados(
        `${API_URL}/produtos`,
        "Erro ao listar produtos."
    );
}

export async function buscarProdutoPorCodigoBarras(codigoBarras) {
    return requisitarDados(
        `${API_URL}/produtos/codigo-barras/${encodeURIComponent(codigoBarras)}`,
        "Erro ao buscar produto."
    );
}

export async function consultarProdutoExterno(codigoBarras) {
    return requisitarDados(
        `${API_URL}/consulta-externa/produtos/${encodeURIComponent(codigoBarras)}`,
        "Erro ao consultar produto na SI5."
    );
}

export async function cadastrarProduto(dadosProduto) {
    return requisitarDados(
        `${API_URL}/produtos`,
        "Erro ao cadastrar produto.",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosProduto)
        }
    );
}

export async function atualizarProduto(id, dadosProduto) {
    return requisitarDados(
        `${API_URL}/produtos/${encodeURIComponent(id)}`,
        "Erro ao atualizar produto.",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosProduto)
        }
    );
}

export async function excluirProduto(id) {
    return requisitarDados(
        `${API_URL}/produtos/${encodeURIComponent(id)}`,
        "Erro ao excluir produto.",
        {
            method: "DELETE"
        }
    );
}
