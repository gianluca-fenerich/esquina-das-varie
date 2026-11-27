const API_URL = "http://localhost:3000";

export async function listarClientesAutorizados() {
    const response = await fetch(`${API_URL}/clientes`);

    const texto = await response.text();

    let dados;

    try {
        dados = texto ? JSON.parse(texto) : [];
    } catch {
        throw new Error("A API retornou uma resposta inválida.");
    }

    if (!response.ok) {
        throw new Error(
            dados.mensagem || "Erro ao consultar clientes."
        );
    }

    if (!Array.isArray(dados)) {
        throw new Error("A API retornou uma lista de clientes inválida.");
    }

    return dados.filter((cliente) => {
        return (
            cliente.ativo === true &&
            cliente.compraPrazoAutorizada === true
        );
    });
}
