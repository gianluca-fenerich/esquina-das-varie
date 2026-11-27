import express from "express";
import cors from "cors";
import produtosRoutes from "./routes/produtosRoute.js";
import consultaExternaRoutes from "./routes/consultaExternaRoute.js";
import vendasRoutes from "./routes/vendasRoute.js";
import clientesRoutes from "./routes/clientesRoute.js";
import contasReceberRoutes from "./routes/contasReceberRoute.js";

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

app.use('/produtos', produtosRoutes);
app.use('/consulta-externa', consultaExternaRoutes);
app.use("/vendas", vendasRoutes);
app.use("/clientes", clientesRoutes);
app.use("/contas-receber", contasReceberRoutes);

app.get('/', (req, res) => {
    return res.status(200).json({
        mensagem: "API da Esquina das Variedades está funcionando."
    });
});

export default app;
