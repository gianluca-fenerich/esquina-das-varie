const FORMAS_PAGAMENTO = [
    "dinheiro",
    "pix",
    "cartao"
];

export function validarContaReceberId(id) {
    if (!/^[1-9]\d*$/.test(id)) {
        return false;
    }

    const numero = Number(id);

    return Number.isSafeInteger(numero);
}

export function validarDadosRecebimento(dados) {
    if (
        !Number.isSafeInteger(dados.valorCentavos) ||
        dados.valorCentavos <= 0
    ) {
        return "O valor do recebimento deve ser um inteiro positivo em centavos.";
    }

    if (!FORMAS_PAGAMENTO.includes(dados.formaPagamento)) {
        return "Forma de pagamento inválida.";
    }

    return null;
}
