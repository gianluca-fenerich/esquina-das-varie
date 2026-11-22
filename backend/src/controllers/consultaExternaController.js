import { buscarProdutoNaSI5 } from "../services/si5Service.js";

export async function consultarProdutoExterno(req, res) {
    const { codigoBarras } = req.params;

    const codigoValido = /^\d{8,14}$/.test(codigoBarras);

    if (!codigoValido) {
        return res.status(400).json({
            mensagem: "O código de barras deve conter entre 8 e 14 dígitos."
        });
    }

    try {
        const dados = await buscarProdutoNaSI5(codigoBarras);

        if (
            !dados ||
            typeof dados !== "object" ||
            dados.codbar !== codigoBarras ||
            typeof dados.produto !== "string" ||
            dados.produto.trim() === "" ||
            dados.produto.trim().toLowerCase() === "teste"
        ) {
            return res.status(404).json({
                mensagem: "Nenhum produto confiável foi encontrado para esse código."
            });
        }

        return res.status(200).json({
            codigoBarras: dados.codbar,
            nome: dados.produto,
            marca: dados.marca ?? null,
            categoria: dados.categoria ?? null,
            imagemUrl: dados.imagem_url ?? null
        });

    } catch (error) {
        console.error("Erro ao consultar SI5:", error);

        if (error.status === 404) {
            return res.status(404).json({
                mensagem: "Produto não encontrado na SI5."
            });
        }

        if (error.status === 429) {
            return res.status(429).json({
                mensagem: "Limite de consultas da SI5 atingido."
            });
        }

        return res.status(502).json({
            mensagem: "Não foi possível consultar a API externa."
        });
    }
}
