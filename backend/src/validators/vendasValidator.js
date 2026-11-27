const FORMAS_PAGAMENTO = [
    "dinheiro",
    "pix",
    "cartao",
    "prazo"
];

export function validarDadosVenda(dados) {
    if (
        !dados ||
        typeof dados !== "object" ||
        Array.isArray(dados)
    ) {
        return false;
    }

    if (!FORMAS_PAGAMENTO.includes(dados.formaPagamento)) {
        return false;
    }

    if (
        !Array.isArray(dados.itens) ||
        dados.itens.length === 0
    ) {
        return false;
    }

    const vendaPrazo = dados.formaPagamento === "prazo";

    if (vendaPrazo) {
        if (
            !Number.isSafeInteger(dados.clienteId) ||
            dados.clienteId <= 0
        ) {
            return false;
        }
    } else if (dados.clienteId !== undefined) {
        return false;
    }

    return dados.itens.every((item) => {
        return (
            item &&
            typeof item === "object" &&
            !Array.isArray(item) &&
            Number.isSafeInteger(item.produtoId) &&
            item.produtoId > 0 &&
            Number.isSafeInteger(item.quantidade) &&
            item.quantidade > 0
        );
    });
}
