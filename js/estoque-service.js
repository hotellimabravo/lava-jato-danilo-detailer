// ==========================================================================
// EstoqueService: Controle de Insumos, Produtos e Alertas de Estoque Mínimo
// ==========================================================================

const EstoqueService = {
	STORAGE_KEY: 'estoque_produtos',

	getEstoqueDefault: function () {
		return [
			{ id: 'est_1', nome: 'Shampoo Neutro Concentrado (5L)', categoria: 'Químicos / Lavagem', quantidade: 4, qtdMinima: 2, unidade: 'Galão', precoCusto: 65.00, precoVenda: 0, margemLucro: 0, tipo: 'interno' },
			{ id: 'est_2', nome: 'Desengraxante / APC (5L)', categoria: 'Químicos / Lavagem', quantidade: 2, qtdMinima: 2, unidade: 'Galão', precoCusto: 85.00, precoVenda: 0, margemLucro: 0, tipo: 'interno' },
			{ id: 'est_3', nome: 'Cera Carnaúba Líquida Premium (1L)', categoria: 'Ceras e Proteção', quantidade: 3, qtdMinima: 1, unidade: 'Frasco', precoCusto: 120.00, precoVenda: 0, margemLucro: 0, tipo: 'interno' },
			{ id: 'est_4', nome: 'Pretinho / Brilho para Pneus (5L)', categoria: 'Pneus e Rodas', quantidade: 5, qtdMinima: 2, unidade: 'Galão', precoCusto: 45.00, precoVenda: 0, margemLucro: 0, tipo: 'interno' },
			{ id: 'est_5', nome: 'Vitrificador de Pintura 9H (50ml)', categoria: 'Detailing / Proteção', quantidade: 2, qtdMinima: 1, unidade: 'Frasco', precoCusto: 250.00, precoVenda: 0, margemLucro: 0, tipo: 'interno' },
			{ id: 'est_6', nome: 'Panos de Microfibra 40x40cm 350GSM', categoria: 'Acessórios', quantidade: 25, qtdMinima: 10, unidade: 'Unidade', precoCusto: 8.50, precoVenda: 0, margemLucro: 0, tipo: 'interno' },
			{ id: 'est_7', nome: 'Aromatizante Automotivo Gel / Folha', categoria: 'Acessórios e Balcão', quantidade: 18, qtdMinima: 5, unidade: 'Unidade', precoCusto: 8.00, precoVenda: 20.00, margemLucro: 150.00, tipo: 'venda' },
			{ id: 'est_8', nome: 'Cera Líquida Spray Pós-Lavagem (500ml)', categoria: 'Ceras e Proteção', quantidade: 8, qtdMinima: 3, unidade: 'Frasco', precoCusto: 22.00, precoVenda: 45.00, margemLucro: 104.55, tipo: 'venda' },
			{ id: 'est_9', nome: 'Silicone Gel Brilho Pneus/Painel (500ml)', categoria: 'Ceras e Proteção', quantidade: 10, qtdMinima: 4, unidade: 'Frasco', precoCusto: 14.00, precoVenda: 30.00, margemLucro: 114.28, tipo: 'venda' }
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
			const lista = JSON.parse(salvo) || [];
			// Migração e compatibilidade com dados existentes
			lista.forEach(p => {
				if (!p.tipo) {
					p.tipo = (parseFloat(p.precoVenda || 0) > 0) ? 'venda' : 'interno';
				}
				p.precoVenda = parseFloat(p.precoVenda || 0);
				p.margemLucro = parseFloat(p.margemLucro || 0);
			});
			return lista;
		} catch (e) {
			return [];
		}
	},

	salvarProdutos: function (lista) {
		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(lista));
	},

	adicionarProduto: function (prod) {
		const lista = this.getProdutos();
		const tipo = prod.tipo === 'venda' ? 'venda' : 'interno';
		const precoCusto = parseFloat(prod.precoCusto || 0);
		let precoVenda = parseFloat(prod.precoVenda || 0);
		let margemLucro = parseFloat(prod.margemLucro || 0);

		// Garantir cálculo de margem/preço de venda consistente
		if (tipo === 'venda') {
			if (precoVenda > 0 && precoCusto > 0 && margemLucro === 0) {
				margemLucro = ((precoVenda - precoCusto) / precoCusto) * 100;
			} else if (margemLucro > 0 && precoCusto > 0 && precoVenda === 0) {
				precoVenda = precoCusto * (1 + margemLucro / 100);
			}
		} else {
			precoVenda = 0;
			margemLucro = 0;
		}

		const novo = {
			id: 'est_' + Date.now(),
			nome: prod.nome,
			categoria: prod.categoria || 'Geral',
			quantidade: parseFloat(prod.quantidade || 0),
			qtdMinima: parseFloat(prod.qtdMinima || 1),
			unidade: prod.unidade || 'Unidade',
			precoCusto: precoCusto,
			precoVenda: precoVenda,
			margemLucro: margemLucro,
			tipo: tipo,
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
	},

	getProdutosParaVenda: function () {
		const produtos = this.getProdutos();
		return produtos.filter(p => p.tipo === 'venda');
	},

	darBaixaEstoqueVenda: function (itensVendidos) {
		if (!itensVendidos || !Array.isArray(itensVendidos) || itensVendidos.length === 0) return;
		const lista = this.getProdutos();
		let alterou = false;

		itensVendidos.forEach(v => {
			const prodId = v.id || v.produtoId;
			const qtdVendida = parseFloat(v.quantidade || 1);
			const item = lista.find(p => p.id === prodId);
			if (item) {
				item.quantidade = Math.max(0, (item.quantidade || 0) - qtdVendida);
				item.atualizadoEm = new Date().toISOString();
				alterou = true;
			}
		});

		if (alterou) {
			this.salvarProdutos(lista);
		}
	}
};

if (typeof window !== 'undefined') {
	window.EstoqueService = EstoqueService;
}
