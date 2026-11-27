import { useState } from "react";

import Caixa from "./pages/Caixa";
import Produtos from "./pages/Produtos";
import Registro from "./pages/Registro";

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
            </nav>

            {paginaAtual === "caixa" && <Caixa />}
            {paginaAtual === "produtos" && <Produtos />}
            {paginaAtual === "registro" && <Registro />}
        </>
    );
}

export default App;