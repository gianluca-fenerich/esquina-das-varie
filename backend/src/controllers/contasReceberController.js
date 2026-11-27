import {
    listarContasReceber as consultarContasReceber
} from "../data/contasReceberData.js";

import {
    registrarRecebimento as salvarRecebimento
} from "../data/contasReceberData.js";

import {
    validarContaReceberId,
    validarDadosRecebimento
} from "../validators/recebimentosValidator.js";

export async function listarContasReceber(req, res) {
    try {
        const contas = await consultarContasReceber();

        return res.status(200).json(contas);
    } catch (error) {
        console.error("Erro ao listar contas a receber:", error);

        return res.status(500).json({
            mensagem: "Erro ao consultar contas a receber."
        });
    }
}


export async function registrarRecebimento(req, res) {
    const { id } = req.params;
    const dados = req.body;

    if (!validarContaReceberId(id)) {
        return res.status(400).json({
            mensagem: "Identificador da conta inválido."
        });
    }

    const erroValidacao = validarDadosRecebimento(dados);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    try {
        const recebimento = await salvarRecebimento({
            contaReceberId: Number(id),
            valorCentavos: dados.valorCentavos,
            formaPagamento: dados.formaPagamento
        });

        return res.status(201).json({
            mensagem: "Recebimento registrado com sucesso.",
            recebimento
        });
    } catch (error) {
        console.error("Erro ao registrar recebimento:", error);

        if (error.code === "P0001") {
            return res.status(400).json({
                mensagem: error.message
            });
        }

        return res.status(500).json({
            mensagem: "Erro ao registrar recebimento."
        });
    }
}
