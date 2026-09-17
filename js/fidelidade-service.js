// ==========================================================================
// FidelidadeService: Programa de Selos / Pontos e Automações de Retorno
// ==========================================================================

const FidelidadeService = {
	STORAGE_CONFIG_KEY: 'fidelidade_config',

	getConfig: function () {
		const salvo = localStorage.getItem(this.STORAGE_CONFIG_KEY);
		if (salvo) {
			try { return JSON.parse(salvo); } catch (e) {}
		}
		return {
			ativo: true,
			metaSelos: 10,
			premioDescricao: 'Brinde Especial',
			diasSugeridosRetorno: 25,
			servicoQualificado: ''
		};
	},

	salvarConfig: function (cfg) {
		localStorage.setItem(this.STORAGE_CONFIG_KEY, JSON.stringify(cfg));
	},

	/**
	 * Retorna o progresso de fidelidade do cliente baseado nas O.S. encerradas
	 */
	getProgressoCliente: function (clienteNomeOuTel) {
		if (!clienteNomeOuTel) return { totalLavagens: 0, selosAtuais: 0, resgatesDisponiveis: 0 };
		
		const cfg = this.getConfig();
		const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
		const termo = clienteNomeOuTel.trim().toLowerCase();

		const pedidosDoCliente = pedidos.filter(p => {
			const nome = (p.cliente || '').toLowerCase();
			const statusOk = p.status === 'encerrado';
			const clienteOk = (nome === termo || nome.includes(termo));
			let servicoOk = true;
			if (cfg.servicoQualificado && cfg.servicoQualificado.trim() !== '') {
			    const servs = (p.servicos || '').toLowerCase();
			    const svcQual = cfg.servicoQualificado.toLowerCase().trim();
			    servicoOk = servs.includes(svcQual);
			}
			return statusOk && clienteOk && servicoOk;
		});

		const total = pedidosDoCliente.length;
		const meta = cfg.metaSelos || 10;
		const resgates = Math.floor(total / meta);
		const selos = total % meta;

		return {
			totalLavagens: total,
			selosAtuais: selos,
			metaSelos: meta,
			resgatesDisponiveis: resgates,
			premio: cfg.premioDescricao
		};
	},

	/**
	 * Gera lista de clientes para reativação / pós-venda (sem visitar há mais de X dias)
	 */
	getClientesParaReativar: function () {
		const cfg = this.getConfig();
		const diasAlvo = cfg.diasSugeridosRetorno || 25;
		const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
		const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];

		const hoje = new Date();
		const resultados = [];

		clientes.forEach(c => {
			const pedidosDoCliente = pedidos.filter(p => {
				const nomeP = (p.cliente || '').toLowerCase();
				const nomeC = (c.nome || '').toLowerCase();
				return p.status === 'encerrado' && (nomeP === nomeC || (c.tel1 && p.cliente.includes(c.tel1)));
			});

			if (pedidosDoCliente.length > 0) {
				// Ordena pelo mais recente
				pedidosDoCliente.sort((a, b) => {
					const dataA = a.dataEncerramento || a.data;
					const dataB = b.dataEncerramento || b.data;
					return dataB.localeCompare(dataA);
				});

				const ultimoPedido = pedidosDoCliente[0];
				const dataUltimo = new Date(ultimoPedido.dataEncerramento || ultimoPedido.data);
				const diffTempo = Math.abs(hoje - dataUltimo);
				const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

				if (diffDias >= diasAlvo) {
					resultados.push({
						cliente: c,
						ultimoPedido: ultimoPedido,
						diasSemVisita: diffDias,
						progressoFidelidade: this.getProgressoCliente(c.nome)
					});
				}
			}
		});

		resultados.sort((a, b) => b.diasSemVisita - a.diasSemVisita);
		return resultados;
	}
};

if (typeof window !== 'undefined') {
	window.FidelidadeService = FidelidadeService;
}
