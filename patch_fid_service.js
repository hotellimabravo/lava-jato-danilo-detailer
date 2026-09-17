const fs = require('fs');

let js = fs.readFileSync('js/fidelidade-service.js', 'utf8');

// Modifica o getDefaultConfig para incluir servicoQualificado
js = js.replace(
`		return {
			ativo: true,
			metaSelos: 10,
			premioDescricao: '1 Lavagem Simples Grátis ou R$ 40 de desconto',
			diasSugeridosRetorno: 25
		};`,
`		return {
			ativo: true,
			metaSelos: 10,
			premioDescricao: 'Brinde Especial',
			diasSugeridosRetorno: 25,
			servicoQualificado: ''
		};`
);

// Modifica getProgressoCliente para contar apenas os pedidos que contém o servicoQualificado (se definido)
js = js.replace(
`		const pedidosDoCliente = pedidos.filter(p => {
			const nome = (p.cliente || '').toLowerCase();
			return p.status === 'encerrado' && (nome === termo || nome.includes(termo));
		});`,
`		const pedidosDoCliente = pedidos.filter(p => {
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
		});`
);

fs.writeFileSync('js/fidelidade-service.js', js);
