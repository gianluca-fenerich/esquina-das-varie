import { useState } from "react";

import Caixa from "./pages/Caixa";
import Produtos from "./pages/Produtos";

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
    </nav>

      {paginaAtual === "caixa" && <Caixa />}
      {paginaAtual === "produtos" && <Produtos />}
    </>
    );
}

export default App;