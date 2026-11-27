import { Router } from "express";

import { finalizarVenda } from "../controllers/vendasController.js";

const router = Router();

router.post("/", finalizarVenda);

export default router;
