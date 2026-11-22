import { Router } from "express";
import { consultarProdutoExterno } from "../controllers/consultaExternaController.js";

const router = Router();

router.get("/produtos/:codigoBarras", consultarProdutoExterno);

export default router;
