export function validarIdCliente(id) {
    if (typeof id !== "string") {
        return false;
    }

    if (!/^[1-9]\d*$/.test(id)) {
        return false;
    }

    const numero = Number(id);

    return Number.isSafeInteger(numero);
}

export function validarDadosCliente(dados) {
    if (
        !dados ||
        typeof dados !== "object" ||
        Array.isArray(dados)
    ) {
        return false;
    }

    const camposPermitidos = ["nome"];

    if (
        Object.keys(dados).some(
            (campo) => !camposPermitidos.includes(campo)
        )
    ) {
        return false;
    }

    if (typeof dados.nome !== "string") {
        return false;
    }

    const nome = dados.nome.trim();

    return nome.length > 0 && nome.length <= 120;
}

export function validarAtualizacaoCliente(dados) {
    if (
        !dados ||
        typeof dados !== "object" ||
        Array.isArray(dados)
    ) {
        return false;
    }

    const camposPermitidos = [
        "nome",
        "ativo",
        "compraPrazoAutorizada"
    ];

    const camposRecebidos = Object.keys(dados);

    if (
        camposRecebidos.length === 0 ||
        camposRecebidos.some(
            (campo) => !camposPermitidos.includes(campo)
        )
    ) {
        return false;
    }

    if (dados.nome !== undefined) {
        if (
            typeof dados.nome !== "string" ||
            dados.nome.trim().length === 0 ||
            dados.nome.trim().length > 120
        ) {
            return false;
        }
    }

    if (
        dados.ativo !== undefined &&
        typeof dados.ativo !== "boolean"
    ) {
        return false;
    }

    if (
        dados.compraPrazoAutorizada !== undefined &&
        typeof dados.compraPrazoAutorizada !== "boolean"
    ) {
        return false;
    }

    return true;
}
