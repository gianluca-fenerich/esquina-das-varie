export async function buscarProdutoNaSI5(codigoBarras) {
    const token = process.env.SI5_TOKEN;

    if (!token) {
        throw new Error(
            "O token da SI5 não foi configurado."
        );
    }

    const url = `https://global.si5.com.br/api/produtos/${encodeURIComponent(codigoBarras)}`;

    const resposta = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
        },
        signal: AbortSignal.timeout(10000)
    });

    if (!resposta.ok) {
        const erro = new Error(
            `A SI5 retornou HTTP ${resposta.status}.`
        );

        erro.status = resposta.status;

        throw erro;
    }

    const dados = await resposta.json();

    return dados;
}
