import { Router } from "express";

import { listarProdutos, buscarProdutoPorId, cadastrarProduto, atualizarProduto, deletarProduto } from "../controllers/produtosController.js";

const router = Router();

router.get('/', listarProdutos);

router.get('/:id', buscarProdutoPorId);

router.post('/', cadastrarProduto);

router.put('/:id', atualizarProduto);

router.delete('/:id', deletarProduto);

export default router;