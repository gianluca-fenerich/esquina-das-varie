import { Router } from "express";

import {
    finalizarVenda,
    listarVendasPorData
} from "../controllers/vendasController.js";

const router = Router();

router.get("/", listarVendasPorData);
router.post("/", finalizarVenda);

export default router;