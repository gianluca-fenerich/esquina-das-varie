import {
    listarClientes as listarClientesData,
    cadastrarCliente as cadastrarClienteData,
    atualizarCliente as atualizarClienteData
} from "../data/clientesData.js";

import {
    validarIdCliente,
    validarDadosCliente,
    validarAtualizacaoCliente
} from "../validators/clientesValidator.js";

export async function listarClientes(req, res) {
    try {
        const clientes = await listarClientesData();

        return res.status(200).json(clientes);
    } catch (error) {
        console.error("Erro ao listar clientes:", error);

        return res.status(500).json({
            mensagem: "Erro interno ao consultar os clientes."
        });
    }
}

export async function cadastrarCliente(req, res) {
    const dados = req.body;

    if (!validarDadosCliente(dados)) {
        return res.status(400).json({
            mensagem: "Os dados do cliente são inválidos."
        });
    }

    try {
        const cliente = await cadastrarClienteData(dados);

        return res.status(201).json(cliente);
    } catch (error) {
        console.error("Erro ao cadastrar cliente:", error);

        return res.status(500).json({
            mensagem: "Erro interno ao cadastrar o cliente."
        });
    }
}

export async function atualizarCliente(req, res) {
    const { id } = req.params;

    if (!validarIdCliente(id)) {
        return res.status(400).json({
            mensagem: "O ID deve ser um número inteiro positivo."
        });
    }

    const dados = req.body;

    if (!validarAtualizacaoCliente(dados)) {
        return res.status(400).json({
            mensagem: "Os dados de atualização do cliente são inválidos."
        });
    }

    try {
        const cliente = await atualizarClienteData(
            Number(id),
            dados
        );

        if (!cliente) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado."
            });
        }

        return res.status(200).json(cliente);
    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);

        return res.status(500).json({
            mensagem: "Erro interno ao atualizar o cliente."
        });
    }
}
