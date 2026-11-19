import express from "express";
import produtosRoutes from "./routes/produtosRoute.js";

const app = express();

app.use(express.json());

app.use('/produtos', produtosRoutes);

app.get('/', (req, res) => {
    return res.status(200).json({
        mensagem: "API da Esquina das Variedades está funcionando."
    });
});

export default app;
