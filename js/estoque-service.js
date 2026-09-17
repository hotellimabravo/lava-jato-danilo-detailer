// ==========================================================================
// EstoqueService: Controle de Insumos, Produtos e Alertas de Estoque Mínimo
// ==========================================================================

const EstoqueService = {
	STORAGE_KEY: 'estoque_produtos',

	getEstoqueDefault: function () {
		return [
			{ id: 'est_1', nome: 'Shampoo Neutro Concentrado (5L)', categoria: 'Químicos / Lavagem', quantidade: 4, qtdMinima: 2, unidade: 'Galão', precoCusto: 65.00 },
			{ id: 'est_2', nome: 'Desengraxante / APC (5L)', categoria: 'Químicos / Lavagem', quantidade: 2, qtdMinima: 2, unidade: 'Galão', precoCusto: 85.00 },
			{ id: 'est_3', nome: 'Cera Carnaúba Líquida Premium (1L)', categoria: 'Ceras e Proteção', quantidade: 3, qtdMinima: 1, unidade: 'Frasco', precoCusto: 120.00 },
			{ id: 'est_4', nome: 'Pretinho / Brilho para Pneus (5L)', categoria: 'Pneus e Rodas', quantidade: 5, qtdMinima: 2, unidade: 'Galão', precoCusto: 45.00 },
			{ id: 'est_5', nome: 'Vitrificador de Pintura 9H (50ml)', categoria: 'Detailing / Proteção', quantidade: 2, qtdMinima: 1, unidade: 'Frasco', precoCusto: 250.00 },
			{ id: 'est_6', nome: 'Panos de Microfibra 40x40cm 350GSM', categoria: 'Acessórios', quantidade: 25, qtdMinima: 10, unidade: 'Unidade', precoCusto: 8.50 }
		];
	},

	getProdutos: function () {
		const salvo = localStorage.getItem(this.STORAGE_KEY);
		if (!salvo) {
			const def = this.getEstoqueDefault();
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(def));
			return def;
		}
		try {
			return JSON.parse(salvo) || [];
		} catch (e) {
			return [];
		}
	},

	salvarProdutos: function (lista) {
		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(lista));
	},

	adicionarProduto: function (prod) {
		const lista = this.getProdutos();
		const novo = {
			id: 'est_' + Date.now(),
			nome: prod.nome,
			categoria: prod.categoria || 'Geral',
			quantidade: parseFloat(prod.quantidade || 0),
			qtdMinima: parseFloat(prod.qtdMinima || 1),
			unidade: prod.unidade || 'Unidade',
			precoCusto: parseFloat(prod.precoCusto || 0),
			atualizadoEm: new Date().toISOString()
		};
		lista.push(novo);
		this.salvarProdutos(lista);
		return novo;
	},

	atualizarQuantidade: function (id, novaQtd) {
		const lista = this.getProdutos();
		const item = lista.find(p => p.id === id);
		if (item) {
			item.quantidade = parseFloat(novaQtd || 0);
			item.atualizadoEm = new Date().toISOString();
			this.salvarProdutos(lista);
		}
	},

	ajustarEstoque: function (id, delta) {
		const lista = this.getProdutos();
		const item = lista.find(p => p.id === id);
		if (item) {
			item.quantidade = Math.max(0, (item.quantidade || 0) + delta);
			item.atualizadoEm = new Date().toISOString();
			this.salvarProdutos(lista);
		}
	},

	removerProduto: function (id) {
		let lista = this.getProdutos();
		lista = lista.filter(p => p.id !== id);
		this.salvarProdutos(lista);
	},

	getAlertasEstoqueBaixo: function () {
		const produtos = this.getProdutos();
		return produtos.filter(p => (p.quantidade || 0) <= (p.qtdMinima || 0));
	}
};

if (typeof window !== 'undefined') {
	window.EstoqueService = EstoqueService;
}
