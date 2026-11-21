import { listarProdutos as listarProdutosData, buscarProdutoPorId as buscarProdutoPorIdData, buscarProdutoPorCodigoBarras as buscarProdutoPorCodigoBarrasData, cadastrarProduto as cadastrarProdutoData, atualizarProduto as atualizarProdutoData, deletarProduto as deletarProdutoData } from "../data/produtosData.js";

import { validarIdProduto, validarDadosProduto, validarDadosProdutoCompleto } from "../validators/produtosValidator.js";

export async function listarProdutos(req, res) {
    try {
        const produtos = await listarProdutosData();

        return res.status(200).json(produtos);
    } catch (error) {
        console.error('Erro ao listar produtos:', error);

        return res.status(500).json({
            mensagem: 'Erro interno ao consultar os produtos.'
        })
    }
}

export async function buscarProdutoPorId(req, res) {
    const { id } = req.params;

    if (!validarIdProduto(id)) {
            return res.status(400).json({
                mensagem: "O ID deve ser um número inteiro positivo."
            });
        }

    try {
        const produto = await buscarProdutoPorIdData(Number(id));

        if (!produto) {
            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });
        }

        return res.status(200).json(produto);
    } catch (error) {
        console.error('Erro ao buscar produto:', error);

        return res.status(500).json({
            mensagem: 'Erro interno ao consultar o produto.'
        });
    }
}

export async function buscarProdutoPorCodigoBarras(req, res) {
    const { codigoBarras } = req.params;

    if (!codigoBarras) {
        return res.status(400).json({
            mensagem: 'O código de barras não pode ser vazio.'
        });
    }

    try {
        const produto = await buscarProdutoPorCodigoBarrasData(codigoBarras);

        if (!produto) {
            return res.status(404).json({
                mensagem: 'Produto não encontrado.'
            });
        }

        return res.status(200).json(produto);
    } catch (error) {
        console.error('Erro ao buscar produto por código de barras:', error);

        return res.status(500).json({
            mensagem: 'Erro interno ao consultar o produto'
        });
    }
}

export async function cadastrarProduto (req, res) {
    const dados = req.body;

    if (!validarDadosProduto(dados)) {
        return res.status(400).json({
            mensagem: "Os dados do produto são inválidos."
        });
    }

    try {
        const produto = await cadastrarProdutoData(dados);

        return res.status(201).json(produto);
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);

        return res.status(500).json({
            mensagem: 'Erro interno ao cadastrar o produto.'
        });
    }
}

export async function atualizarProduto (req, res) {
    const { id } = req.params;

    if (!validarIdProduto(id)) {
        return res.status(400).json({
            mensagem: 'O ID deve ser um número inteiro positivo.'
        });
    }

    const dados = req.body;

    if (!validarDadosProdutoCompleto(dados)) {
        return res.status(400).json({
            mensagem: "Os dados do produto são inválidos ou incompletos."
        });
    }

    try {
        const produto = await atualizarProdutoData(Number(id), dados);

        if (!produto) {
        return res.status(404).json({
            mensagem: "Produto não encontrado."
        });
        }

        return res.status(200).json(produto);
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
        
            return res.status(500).json({
                mensagem: 'Erro interno ao atualizar o produto.'
            });
        }
}

export async function deletarProduto (req, res) {
    const { id } = req.params;

    if (!validarIdProduto(id)) {
        return res.status(400).json({
            mensagem: "O ID deve ser um número inteiro positivo."
        });
    }

    try {
        const produto = await deletarProdutoData(Number(id));
        
        if (!produto) {
            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });
        }
    
        return res.sendStatus(204);
    } catch (error) {
        console.error('Erro ao deletar produto:', error);

        return res.status(500).json({
            mensagem: 'Erro interno ao deletar o produto.'
        });
    }   
}