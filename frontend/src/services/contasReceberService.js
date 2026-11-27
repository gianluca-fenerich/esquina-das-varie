
const API_URL = "http://localhost:3000";

async function requisitarDados(url, mensagemErro, opcoes = {}) {
    const response = await fetch(url, opcoes);

    const texto = await response.text();

    const dados = texto ? JSON.parse(texto) : null;

    if (!response.ok) {
        throw new Error(dados?.mensagem || mensagemErro);
    }

    return dados;
}

export async function listarContasReceber() {
    return requisitarDados(
        `${API_URL}/contas-receber`,
        "Erro ao listar contas a receber."
    );
}

export async function registrarRecebimento(contaReceberId, dadosRecebimento) {
    return requisitarDados(
        `${API_URL}/contas-receber/${encodeURIComponent(contaReceberId)}/recebimentos`,
        "Erro ao registrar recebimento.",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosRecebimento)
        }
    );
}
