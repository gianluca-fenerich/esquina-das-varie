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

export async function finalizarVenda(dadosVenda) {
    return requisitarDados(
        `${API_URL}/vendas`,
        "Erro ao finalizar venda.",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosVenda)
        }
    );
}