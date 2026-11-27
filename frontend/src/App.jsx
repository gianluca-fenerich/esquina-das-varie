import { useState } from "react";

import Caixa from "./pages/Caixa";
import Produtos from "./pages/Produtos";
import Registro from "./pages/Registro";
import ContasReceber from "./pages/ContasReceber";

function App() {
    const [paginaAtual, setPaginaAtual] = useState("caixa");

    return (
        <>
            <nav>
                <button
                    type="button"
                    onClick={() => setPaginaAtual("caixa")}
                >
                    Caixa
                </button>

                <button
                    type="button"
                    onClick={() => setPaginaAtual("produtos")}
                >
                    Produtos
                </button>

                <button
                    type="button"
                    onClick={() => setPaginaAtual("registro")}
                >
                    Registro
                </button>

                <button
                    type="button"
                    onClick={() => setPaginaAtual("contas-receber")}
                >
                    Contas a Receber
                </button>
            </nav>

            {paginaAtual === "caixa" && <Caixa />}
            {paginaAtual === "produtos" && <Produtos />}
            {paginaAtual === "registro" && <Registro />}
            {paginaAtual === "contas-receber" && <ContasReceber />}
        </>
    );
}

export default App;
