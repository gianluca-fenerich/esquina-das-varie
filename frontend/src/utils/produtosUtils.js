export const SECOES = [
    { id: "listagem", nome: "Listagem" },
    { id: "cadastro", nome: "Cadastro" },
    { id: "edicao", nome: "Edição" },
    { id: "exclusao", nome: "Exclusão" }
];

export const FORMULARIO_VAZIO = {
    nome: "",
    codigoBarras: "",
    marca: "",
    categoria: "",
    imagemUrl: "",
    precoCusto: "",
    precoVenda: "",
    quantidadeEstoque: ""
};

export function formatarMoeda(valorEmCentavos) {
    if (valorEmCentavos === null || valorEmCentavos === undefined) {
        return "Não informado";
    }

    return (valorEmCentavos / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

export function converterCentavosParaReais(valorEmCentavos) {
    if (valorEmCentavos === null || valorEmCentavos === undefined) {
        return "";
    }

    return (valorEmCentavos / 100).toFixed(2);
}

export function converterReaisParaCentavos(valor) {
    if (valor === null || valor === undefined || valor.trim() === "") {
        return null;
    }

    const valorNumerico = Number(valor.replace(",", "."));

    if (!Number.isFinite(valorNumerico)) {
        return null;
    }

    return Math.round(valorNumerico * 100);
}

export function validarDadosComerciais(dados) {
    if (!dados.nome || dados.nome.trim() === "") {
        return "O nome do produto é obrigatório.";
    }

    if (
        dados.codigoBarras &&
        !/^\d{8,14}$/.test(dados.codigoBarras.trim())
    ) {
        return "O código de barras deve conter entre 8 e 14 números.";
    }

    const precoCustoCentavos = converterReaisParaCentavos(
        dados.precoCusto
    );

    const precoVendaCentavos = converterReaisParaCentavos(
        dados.precoVenda
    );

    if (
        precoCustoCentavos === null ||
        precoCustoCentavos < 0
    ) {
        return "Informe um preço de custo válido.";
    }

    if (
        precoVendaCentavos === null ||
        precoVendaCentavos < 0
    ) {
        return "Informe um preço de venda válido.";
    }

    const quantidadeEstoque = Number(dados.quantidadeEstoque);

    if (
        dados.quantidadeEstoque === "" ||
        !Number.isInteger(quantidadeEstoque) ||
        quantidadeEstoque < 0
    ) {
        return "Informe uma quantidade de estoque válida.";
    }

    return null;
}

export function prepararDadosParaFormulario(produto) {
    return {
        nome: produto.nome ?? "",
        codigoBarras: produto.codigoBarras ?? "",
        marca: produto.marca ?? "",
        categoria: produto.categoria ?? "",
        imagemUrl: produto.imagemUrl ?? "",
        precoCusto: converterCentavosParaReais(
            produto.precoCustoCentavos
        ),
        precoVenda: converterCentavosParaReais(
            produto.precoVendaCentavos
        ),
        quantidadeEstoque: String(produto.quantidadeEstoque ?? "")
    };
}

export function prepararDadosParaAPI(dados) {
    return {
        nome: dados.nome.trim(),
        codigoBarras: dados.codigoBarras.trim() || null,
        marca: dados.marca.trim() || null,
        categoria: dados.categoria.trim() || null,
        imagemUrl: dados.imagemUrl.trim() || null,
        precoCustoCentavos: converterReaisParaCentavos(
            dados.precoCusto
        ),
        precoVendaCentavos: converterReaisParaCentavos(
            dados.precoVenda
        ),
        quantidadeEstoque: Number(dados.quantidadeEstoque)
    };
}

export function obterProdutoDaResposta(resposta) {
    return resposta?.produto ?? resposta?.dados ?? resposta;
}

export function obterListaDaResposta(resposta) {
    if (Array.isArray(resposta)) {
        return resposta;
    }

    if (Array.isArray(resposta?.produtos)) {
        return resposta.produtos;
    }

    if (Array.isArray(resposta?.dados)) {
        return resposta.dados;
    }

    return [];
}
