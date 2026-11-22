import express from "express";
import cors from "cors";
import produtosRoutes from "./routes/produtosRoute.js";
import consultaExternaRoutes from "./routes/consultaExternaRoute.js";

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

app.use('/produtos', produtosRoutes);
app.use('/consulta-externa', consultaExternaRoutes);

app.get('/', (req, res) => {
    return res.status(200).json({
        mensagem: "API da Esquina das Variedades está funcionando."
    });
});

export default app;
