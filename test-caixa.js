const fs = require('fs');

// Mock localStorage
const store = {};
global.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => store[k] = v,
};

global.obterDataHojeISO = () => '2026-09-16';
global.obterHoraAtual = () => '18:00';

class CaixaService {
	static reabrirCaixaHoje() {
		const hoje = obterDataHojeISO();
		let fechamentos = JSON.parse(localStorage.getItem('caixas_fechados')) || [];
		fechamentos = fechamentos.filter(f => f.data !== hoje);
		localStorage.setItem('caixas_fechados', JSON.stringify(fechamentos));

		const caixaAtual = {
			data: hoje,
			status: 'aberto',
			horaAbertura: obterHoraAtual(),
			fundoTroco: 0
		};
		localStorage.setItem('caixa_atual', JSON.stringify(caixaAtual));
	}
}

store['caixa_atual'] = JSON.stringify({ data: '2026-09-16', status: 'fechado', fundoTroco: 50, horaAbertura: '08:00', horaFechamento: '17:00' });
store['caixas_fechados'] = JSON.stringify([{ data: '2026-09-16', fundoTroco: 50, totalValor: 100 }]);

CaixaService.reabrirCaixaHoje();
console.log(store['caixa_atual']);
console.log(store['caixas_fechados']);
