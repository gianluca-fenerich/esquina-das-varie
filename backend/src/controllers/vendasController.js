import {
    finalizarVenda as finalizarVendaData,
    listarVendasPorData as listarVendasPorDataData
} from "../data/vendasData.js";

import { validarDadosVenda } from "../validators/vendasValidator.js";

function validarData(data) {
    if (
        typeof data !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(data)
    ) {
        return false;
    }

    const dataConvertida = new Date(`${data}T00:00:00Z`);

    return (
        !Number.isNaN(dataConvertida.getTime()) &&
        dataConvertida.toISOString().slice(0, 10) === data
    );
}

function obterIntervaloData(data) {
    const [ano, mes, dia] = data.split("-").map(Number);

    const dataInicio = new Date(
        `${data}T00:00:00-03:00`
    );

    const proximoDia = new Date(
        Date.UTC(ano, mes - 1, dia + 1)
    );

    const dataProximoDia = proximoDia
        .toISOString()
        .slice(0, 10);

    const dataFim = new Date(
        `${dataProximoDia}T00:00:00-03:00`
    );

    return {
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString()
    };
}

export async function listarVendasPorData(req, res) {
    const data = req.query.data;

    if (!validarData(data)) {
        return res.status(400).json({
            mensagem: "Informe uma data válida no formato AAAA-MM-DD."
        });
    }

    const { dataInicio, dataFim } = obterIntervaloData(data);

    try {
        const vendas = await listarVendasPorDataData(
            dataInicio,
            dataFim
        );

        return res.status(200).json(vendas);
    } catch (error) {
        console.error("Erro ao listar vendas:", error);

        return res.status(500).json({
            mensagem: "Erro interno ao consultar o histórico de vendas."
        });
    }
}

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