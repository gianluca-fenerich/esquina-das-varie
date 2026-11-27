import { Router } from "express";

import {
    listarContasReceber,
    registrarRecebimento
} from "../controllers/contasReceberController.js";

const router = Router();

router.get("/", listarContasReceber);

router.post("/:id/recebimentos", registrarRecebimento);

export default router;
