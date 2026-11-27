
import { Router } from "express";

import {
    listarClientes,
    cadastrarCliente,
    atualizarCliente
} from "../controllers/clientesController.js";

const router = Router();

router.get("/", listarClientes);

router.post("/", cadastrarCliente);

router.patch("/:id", atualizarCliente);

export default router;
