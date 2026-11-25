function Mensagem({ tipo = "erro", children }) {
    if (!children) {
        return null;
    }

    const classes =
        tipo === "sucesso"
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-700";

    return (
        <div className={`rounded-lg border px-4 py-3 text-sm ${classes}`}>
            {children}
        </div>
    );
}

export default Mensagem;