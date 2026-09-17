// ==========================================================================
// VistoriaService: Checklist de Entrada & Mapeamento de Avarias
// ==========================================================================

const VistoriaService = {
	STORAGE_KEY: 'vistorias_veiculos',

	getVistoriaPorPedidoId: function (pedidoId) {
		const vistorias = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
		return vistorias[pedidoId] || null;
	},

	salvarVistoria: function (pedidoId, dadosVistoria) {
		const vistorias = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
		vistorias[pedidoId] = {
			...dadosVistoria,
			pedidoId: pedidoId,
			atualizadoEm: new Date().toISOString()
		};
		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(vistorias));
		return vistorias[pedidoId];
	}
};

if (typeof window !== 'undefined') {
	window.VistoriaService = VistoriaService;
}
