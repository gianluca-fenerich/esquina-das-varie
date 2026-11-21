const API_URL = 'http://localhost:3000'

export async function buscarProdutoPorCodigoBarras(codigoBarras) {
    const response = await fetch(
        `${API_URL}/produtos/codigo-barras/${encodeURIComponent(codigoBarras)}`
    )

    const dados = await response.json()

    if (!response) {
        throw new Error(dados.mensagem || 'Erro ao buscar produto.')
    }

    return dados
}