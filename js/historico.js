// ==========================================================================
// Histórico de Atendimentos por Cliente
// ==========================================================================

const params = new URLSearchParams(window.location.search);
const clienteNome = params.get('cliente') || '';

const elClienteNome = document.getElementById('clienteNome');
const elTotalVisitas = document.getElementById('clienteTotalVisitas');
const elTotalGasto = document.getElementById('clienteTotalGasto');
const tabelaCorpo = document.querySelector('#historicoTable tbody');

if (clienteNome) {
	elClienteNome.textContent = `Cliente: ${clienteNome}`;
} else {
	elClienteNome.textContent = 'Nenhum cliente selecionado';
}

// Pegar pedidos do localStorage
const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];

// Filtrar pedidos do cliente
const historico = clienteNome
	? pedidos.filter(
			(p) =>
				p.cliente &&
				p.cliente.trim().toLowerCase() === clienteNome.trim().toLowerCase()
	  )
	: [];

// Métricas do cliente
let totalGasto = 0;
historico.forEach((p) => {
	// Apenas pedidos encerrados contam para o total efetivamente pago
	if (!p.status || p.status === 'encerrado') {
		totalGasto += parseFloat(p.valor || 0);
	}
});

if (elTotalVisitas) {
	elTotalVisitas.textContent = historico.length;
}

if (elTotalGasto) {
	elTotalGasto.textContent = `R$ ${totalGasto.toFixed(2)}`;
}

// Preencher tabela
tabelaCorpo.innerHTML = '';

if (historico.length === 0) {
	tabelaCorpo.innerHTML = `
		<tr>
			<td colspan="6" class="empty-table-message">
				Nenhum atendimento registrado para este cliente ainda.
			</td>
		</tr>
	`;
} else {
	// Exibir mais recentes primeiro
	[...historico].reverse().forEach((p) => {
		const corObj = obterCorVeiculo(p.cor);
		const modeloTexto = p.modelo ? ` • ${p.modelo}` : '';
		const tr = document.createElement('tr');
		const valorFormatado = parseFloat(p.valor || 0).toFixed(2);
		const estaAberto = p.status === 'aberto';

		const statusBadge = estaAberto
			? '<span class="badge badge-status badge-status-aberto">No Pátio</span>'
			: '<span class="badge badge-status badge-status-encerrado">Encerrado</span>';

		const dataTexto = estaAberto
			? `${p.data || '-'} <small style="color:var(--text-muted);">${p.horaEntrada ? 'às ' + p.horaEntrada : ''}</small>`
			: `${p.dataEncerramento || p.data || '-'} <small style="color:var(--text-muted);">${p.horaEncerramento ? 'às ' + p.horaEncerramento : ''}</small>`;

		const pagamentoTexto = estaAberto
			? '<span style="color:var(--text-muted); font-size:0.85rem;">Aguardando saída</span>'
			: `<span class="badge badge-payment">${p.formaPagamento || 'Outro'}</span>`;

		tr.innerHTML = `
			<td>
				<div class="veiculo-info-cell">
					${renderizarIconeCarro(corObj, 28)}
					<div class="veiculo-meta">
						<span class="badge-placa">${p.placa || 'SEM PLACA'}</span>
						<span class="veiculo-cor-nome">${corObj.nome}${modeloTexto}</span>
					</div>
				</div>
			</td>
			<td>${dataTexto}</td>
			<td>${p.servicos || '-'}</td>
			<td><span class="badge-price">R$ ${valorFormatado}</span></td>
			<td>${statusBadge}</td>
			<td>${pagamentoTexto}</td>
		`;
		tabelaCorpo.appendChild(tr);
	});
}
