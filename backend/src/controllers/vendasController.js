import { finalizarVenda as finalizarVendaData } from "../data/vendasData.js";

import { validarDadosVenda } from "../validators/vendasValidator.js";

export async function finalizarVenda(req, res) {
    const dados = req.body;

    if (!validarDadosVenda(dados)) {
        return res.status(400).json({
            mensagem: "Os dados da venda são inválidos."
        });
    }

    try {
        const venda = await finalizarVendaData(dados);

        return res.status(201).json(venda);
    } catch (error) {
        console.error("Erro ao finalizar venda:", error);

        if (error.code === "P0001") {
            return res.status(400).json({
                mensagem: error.message
            });
        }

        return res.status(500).json({
            mensagem: "Erro interno ao finalizar a venda."
        });
    }
}
