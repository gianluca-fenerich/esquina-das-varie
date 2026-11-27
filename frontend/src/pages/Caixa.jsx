import { useRef, useState } from "react";

import { buscarProdutoPorCodigoBarras } from "../services/produtosService";
import { finalizarVenda } from "../services/vendasService";
import ProdutosVenda from "../components/ProdutosVenda";

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
});

function Caixa() {
    const [codigoBarras, setCodigoBarras] = useState("");
    const temporizadorLeitura = useRef(null);

    const [carrinho, setCarrinho] = useState([]);
    const [mensagemCaixa, setMensagemCaixa] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("erro");

    const [formaPagamento, setFormaPagamento] = useState("dinheiro");
    const [isFinalizando, setIsFinalizando] = useState(false);

    const finalizacaoEmAndamento = useRef(false);

    const totalCentavos = carrinho.reduce((total, produto) => {
        return total + produto.precoVendaCentavos * produto.quantidade;
    }, 0);

    const quantidadeTotal = carrinho.reduce((total, produto) => {
        return total + produto.quantidade;
    }, 0);

    function exibirMensagemCaixa(mensagem, tipo = "erro") {
        setMensagemCaixa(mensagem);
        setTipoMensagem(tipo);
    }

    function adicionarAoCarrinho(produto) {
        if (finalizacaoEmAndamento.current) {
            return;
        }

        const estoqueDisponivel = produto.quantidadeEstoque;

        if (
            !Number.isSafeInteger(estoqueDisponivel) ||
            estoqueDisponivel <= 0
        ) {
            exibirMensagemCaixa("Produto sem estoque disponível.");
            return;
        }

        const produtoExistente = carrinho.find(
            (item) => item.id === produto.id
        );

        if (
            produtoExistente &&
            produtoExistente.quantidade >= estoqueDisponivel
        ) {
            exibirMensagemCaixa("Quantidade máxima em estoque atingida.");
            return;
        }

        setMensagemCaixa("");

        setCarrinho((carrinhoAtual) => {
            const itemExistente = carrinhoAtual.find(
                (item) => item.id === produto.id
            );

            if (itemExistente) {
                return carrinhoAtual.map((item) =>
                    item.id === produto.id
                        ? {
                              ...item,
                              quantidade: item.quantidade + 1
                          }
                        : item
                );
            }

            return [
                ...carrinhoAtual,
                {
                    id: produto.id,
                    nome: produto.nome,
                    codigoBarras: produto.codigoBarras,
                    marca: produto.marca,
                    imagemUrl: produto.imagemUrl,
                    precoVendaCentavos: produto.precoVendaCentavos,
                    quantidadeEstoque: estoqueDisponivel,
                    quantidade: 1
                }
            ];
        });
    }

    function aumentarQuantidade(id) {
        if (finalizacaoEmAndamento.current) {
            return;
        }

        const produto = carrinho.find((item) => item.id === id);

        if (!produto) {
            return;
        }

        if (produto.quantidade >= produto.quantidadeEstoque) {
            exibirMensagemCaixa("Quantidade máxima em estoque atingida.");
            return;
        }

        setMensagemCaixa("");

        setCarrinho((carrinhoAtual) =>
            carrinhoAtual.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          quantidade: item.quantidade + 1
                      }
                    : item
            )
        );
    }

    function diminuirQuantidade(id) {
        if (finalizacaoEmAndamento.current) {
            return;
        }

        setCarrinho((carrinhoAtual) =>
            carrinhoAtual
                .map((item) =>
                    item.id === id
                        ? {
                              ...item,
                              quantidade: item.quantidade - 1
                          }
                        : item
                )
                .filter((item) => item.quantidade > 0)
        );
    }

    function removerProduto(id) {
        if (finalizacaoEmAndamento.current) {
            return;
        }

        setCarrinho((carrinhoAtual) =>
            carrinhoAtual.filter((item) => item.id !== id)
        );
    }

    async function processarLeitura(codigo) {
        try {
            const produto = await buscarProdutoPorCodigoBarras(codigo);

            if (!produto) {
                exibirMensagemCaixa("Produto não encontrado.");
                return;
            }

            if (produto.precoVendaCentavos === null) {
                exibirMensagemCaixa(
                    "Produto sem preço de venda cadastrado."
                );
                return;
            }

            adicionarAoCarrinho(produto);
        } catch (error) {
            console.error("Erro ao consultar produto:", error);

            exibirMensagemCaixa(
                error.message || "Erro ao consultar produto."
            );
        } finally {
            setCodigoBarras("");
        }
    }

    function handleChangeCodigo(event) {
        if (finalizacaoEmAndamento.current) {
            return;
        }

        const codigo = event.target.value;

        setCodigoBarras(codigo);

        clearTimeout(temporizadorLeitura.current);

        if (!codigo.trim()) {
            return;
        }

        temporizadorLeitura.current = setTimeout(() => {
            processarLeitura(codigo.trim());
        }, 100);
    }

    function handleLeituraCodigo(event) {
        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();

        clearTimeout(temporizadorLeitura.current);

        const codigo = codigoBarras.trim();

        if (!codigo) {
            return;
        }

        processarLeitura(codigo);
    }

    async function handleFinalizarVenda() {
        if (
            finalizacaoEmAndamento.current ||
            carrinho.length === 0
        ) {
            return;
        }

        finalizacaoEmAndamento.current = true;
        setIsFinalizando(true);
        setMensagemCaixa("");

        clearTimeout(temporizadorLeitura.current);

        const dadosVenda = {
            formaPagamento,
            itens: carrinho.map((produto) => ({
                produtoId: produto.id,
                quantidade: produto.quantidade
            }))
        };

        try {
            const venda = await finalizarVenda(dadosVenda);

            setCarrinho([]);

            exibirMensagemCaixa(
                `Venda #${venda.id} finalizada com sucesso. Total: ${
                    formatadorMoeda.format(venda.totalCentavos / 100)
                }.`,
                "sucesso"
            );
        } catch (error) {
            console.error("Erro ao finalizar venda:", error);

            exibirMensagemCaixa(
                error.message || "Erro ao finalizar venda."
            );
        } finally {
            finalizacaoEmAndamento.current = false;
            setIsFinalizando(false);
            setCodigoBarras("");
        }
    }

    return (
        <main className="min-h-screen bg-slate-100 text-slate-900">
            <header className="border-b border-slate-200 bg-white px-8 py-5">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Esquina das Variedades
                        </h1>

                        <p className="text-sm text-slate-500">
                            Sistema de caixa
                        </p>
                    </div>

                    <span className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                        Caixa aberto
                    </span>
                </div>
            </header>

            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-8 lg:grid-cols-3">
                <section className="space-y-6 lg:col-span-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <label
                            htmlFor="codigoBarras"
                            className="mb-3 block text-sm font-semibold"
                        >
                            Código de barras
                        </label>

                        <input
                            id="codigoBarras"
                            type="text"
                            placeholder="Escaneie ou digite o código do produto..."
                            value={codigoBarras}
                            onChange={handleChangeCodigo}
                            onKeyDown={handleLeituraCodigo}
                            autoFocus
                            disabled={isFinalizando}
                            className="w-full rounded-lg border border-slate-300 px-4 py-4 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                        />

                        <p className="mt-2 text-sm text-slate-500">
                            Utilize o leitor de código de barras para
                            adicionar produtos.
                        </p>
                    </div>

                    {mensagemCaixa && (
                        <p
                            role="alert"
                            className={`rounded-lg border px-4 py-3 text-sm ${
                                tipoMensagem === "sucesso"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : "border-amber-200 bg-amber-50 text-amber-800"
                            }`}
                        >
                            {mensagemCaixa}
                        </p>
                    )}

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-5">
                            <h2 className="text-lg font-semibold">
                                Produtos da venda
                            </h2>
                        </div>

                        <div className="min-h-72 p-6">
                            <ProdutosVenda
                                carrinho={carrinho}
                                aumentarQuantidade={aumentarQuantidade}
                                diminuirQuantidade={diminuirQuantidade}
                                removerProduto={removerProduto}
                                formatadorMoeda={formatadorMoeda}
                            />
                        </div>
                    </div>
                </section>

                <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold">
                        Resumo da venda
                    </h2>

                    <div className="my-6 space-y-3 border-y border-slate-200 py-5">
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Quantidade de itens</span>
                            <span>{quantidadeTotal}</span>
                        </div>

                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Subtotal</span>
                            <span>
                                {formatadorMoeda.format(
                                    totalCentavos / 100
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Total</span>

                        <span className="text-2xl font-bold text-slate-900">
                            {formatadorMoeda.format(totalCentavos / 100)}
                        </span>
                    </div>

                    <div className="mt-6">
                        <label
                            htmlFor="formaPagamento"
                            className="mb-2 block text-sm font-semibold"
                        >
                            Forma de pagamento
                        </label>

                        <select
                            id="formaPagamento"
                            value={formaPagamento}
                            onChange={(event) =>
                                setFormaPagamento(event.target.value)
                            }
                            disabled={isFinalizando}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                        >
                            <option value="dinheiro">Dinheiro</option>
                            <option value="pix">Pix</option>
                            <option value="cartao">Cartão</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={handleFinalizarVenda}
                        disabled={carrinho.length === 0 || isFinalizando}
                        className={`mt-6 w-full rounded-lg px-4 py-3 font-semibold text-white transition ${
                            carrinho.length === 0 || isFinalizando
                                ? "cursor-not-allowed bg-slate-300"
                                : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                    >
                        {isFinalizando
                            ? "Finalizando venda..."
                            : "Finalizar venda"}
                    </button>
                </aside>
            </div>
        </main>
    );
}

export default Caixa;
