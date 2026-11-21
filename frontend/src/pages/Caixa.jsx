import { useRef, useState } from "react"
import { buscarProdutoPorCodigoBarras } from "../services/produtosService"

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
})

function Caixa() {
  const [codigoBarras, setCodigoBarras] = useState('')
  const temporizadorLeitura = useRef(null)
  const [ carrinho, setCarrinho ] = useState([])

  const totalCentavos = carrinho.reduce((total, produto) => {
    return total + produto.precoVendaCentavos * produto.quantidade
  }, 0)

  const quantidadeTotal = carrinho.reduce((total, produto) => {
    return total + produto.quantidade
  }, 0)

  function adicionarAoCarrinho(produto) {
    setCarrinho((carrinhoAtual) => {
      const produtoExistente = carrinhoAtual.find(
        (item) => item.id === produto.id
      )

      if (produtoExistente) {
        return carrinhoAtual.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      }

      return [
        ...carrinhoAtual,
        {
          id: produto.id,
          nome: produto.nome,
          precoVendaCentavos: produto.precoVendaCentavos,
          quantidade: 1
        }
      ]
    })
  }

  async function processarLeitura(codigo) {
    try {
      const produto = await buscarProdutoPorCodigoBarras(codigo)

      if (produto.precoVendaCentavos === null) {
        console.warn('Produto sem preço de venda cadastrado.')
        return
      }

      adicionarAoCarrinho(produto)

      console.log('Produto adicionado:', produto)

    } catch (error) {
        console.error('Erro ao consultar produto:', error)
    } finally {
        setCodigoBarras('')
    }
  }

  function handleChangeCodigo(event) {
    const codigo = event.target.value

    setCodigoBarras(codigo)

    clearTimeout(temporizadorLeitura.current)

    if (!codigo.trim()) {
        return
    }

    temporizadorLeitura.current = setTimeout(() => {
        processarLeitura(codigo.trim())
    }, 100)
  }

  function handleLeituraCodigo(event) {
    if (event.key !== 'Enter') {
        return
    }

    event.preventDefault()

    clearTimeout(temporizadorLeitura.current)

    const codigo = codigoBarras.trim()

    if (!codigo) {
        return
    }

    processarLeitura(codigo)
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
              className="w-full rounded-lg border border-slate-300 px-4 py-4 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-sm text-slate-500">
              Utilize o leitor de código de barras para adicionar produtos.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-semibold">
                Produtos da venda
              </h2>
            </div>

            <div className="min-h-72 p-6">
    {carrinho.length === 0 ? (
        <div className="flex min-h-60 items-center justify-center">
            <div className="text-center">
                <p className="font-medium text-slate-500">
                    Nenhum produto adicionado
                </p>

                <p className="mt-1 text-sm text-slate-400">
                    Escaneie um código de barras para começar a venda.
                </p>
            </div>
        </div>
    ) : (
        <div className="space-y-4">
            {carrinho.map((produto) => (
                <div
                    key={produto.id}
                    className="flex items-center justify-between border-b border-slate-100 pb-4"
                >
                    <div>
                        <p className="font-medium">
                            {produto.nome}
                        </p>

                        <p className="text-sm text-slate-500">
                            Quantidade: {produto.quantidade}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-slate-500">
                            {formatadorMoeda.format(
                                produto.precoVendaCentavos / 100
                            )}
                            {" × "}
                            {produto.quantidade}
                        </p>

                        <p className="font-semibold">
                            {formatadorMoeda.format(
                                (produto.precoVendaCentavos * produto.quantidade) / 100
                            )}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )}
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
            <span>{formatadorMoeda.format(totalCentavos / 100)}</span>
          </div>
        </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold text-slate-900">
              R$ {(totalCentavos / 100).toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button
            type="button"
            disabled
            className="mt-6 w-full cursor-not-allowed rounded-lg bg-slate-300 px-4 py-3 font-semibold text-white"
          >
            Finalizar venda
          </button>
        </aside>
      </div>
    </main>
  )
}

export default Caixa