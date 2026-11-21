import { Router } from "express";

import { listarProdutos, buscarProdutoPorId, buscarProdutoPorCodigoBarras, cadastrarProduto, atualizarProduto, deletarProduto } from "../controllers/produtosController.js";

const router = Router();

router.get('/', listarProdutos);

router.get('/:id', buscarProdutoPorId);

router.get('/codigo-barras/:codigoBarras', buscarProdutoPorCodigoBarras);

router.post('/', cadastrarProduto);

router.put('/:id', atualizarProduto);

router.delete('/:id', deletarProduto);

export default router;