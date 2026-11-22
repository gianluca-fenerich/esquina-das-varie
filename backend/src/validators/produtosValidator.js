export function validarIdProduto(id) {
    if (typeof id !== "string" || !/^[1-9]\d*$/.test(id)) {
        return false;
    }

    return Number.isSafeInteger(Number(id));
}

export function validarDadosProduto(dados) {
    if (
        dados === null ||
        typeof dados !== "object" ||
        Array.isArray(dados)
    ) {
        return false;
    }

    const camposPermitidos = [
        "nome",
        "codigoBarras",
        "marca",
        "categoria",
        "imagemUrl",
        "precoCustoCentavos",
        "precoVendaCentavos",
        "quantidadeEstoque"
    ];

    const camposRecebidos = Object.keys(dados);

    const possuiCamposDesconhecidos = camposRecebidos.some(
        (campo) => !camposPermitidos.includes(campo)
    );

    if (possuiCamposDesconhecidos) {
        return false;
    }

    if (
        typeof dados.nome !== "string" ||
        dados.nome.trim() === ""
    ) {
        return false;
    }

    if (
        dados.codigoBarras !== undefined &&
        dados.codigoBarras !== null &&
        (
            typeof dados.codigoBarras !== "string" ||
            dados.codigoBarras.trim() === ""
        )
    ) {
        return false;
    }

    const camposTexto = [
    "marca",
    "categoria",
    "imagemUrl"
    ];

    for (const campo of camposTexto) {
        const valor = dados[campo];

        if (
            valor !== undefined &&
            valor !== null &&
            (
                typeof valor !== "string" ||
                valor.trim() === ""
            )
        ) {
            return false;
        }
    }

    const camposNumericos = [
        "precoCustoCentavos",
        "precoVendaCentavos",
        "quantidadeEstoque"
    ];

    for (const campo of camposNumericos) {
        const valor = dados[campo];

        if (
            valor !== undefined &&
            valor !== null &&
            (!Number.isSafeInteger(valor) || valor < 0)
        ) {
            return false;
        }
    }
    return true;
}

export function validarDadosProdutoCompleto(dados) {
    if (!validarDadosProduto(dados)) {
        return false;
    }

    const camposObrigatorios = [
        "nome",
        "codigoBarras",
        "precoCustoCentavos",
        "precoVendaCentavos",
        "quantidadeEstoque"
    ];

    const possuiTodosOsCampos = camposObrigatorios.every(
        campo => Object.hasOwn(dados, campo)
    );

    return possuiTodosOsCampos;
}