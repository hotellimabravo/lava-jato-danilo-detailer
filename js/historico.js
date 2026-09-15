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
				p.cliente.trim().toLowerCase() === clienteNome.trim().toLowerCase(),
	  )
	: [];

// Métricas do cliente
let totalGasto = 0;
historico.forEach((p) => {
	totalGasto += parseFloat(p.valor || 0);
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
			<td colspan="4" class="empty-table-message">
				Nenhum atendimento registrado para este cliente ainda.
			</td>
		</tr>
	`;
} else {
	// Exibir mais recentes primeiro
	[...historico].reverse().forEach((p) => {
		const tr = document.createElement('tr');
		const valorFormatado = parseFloat(p.valor || 0).toFixed(2);
		tr.innerHTML = `
			<td><strong>${p.data || '-'}</strong></td>
			<td>${p.servicos || '-'}</td>
			<td><span class="badge-price">R$ ${valorFormatado}</span></td>
			<td><span class="badge badge-payment">${p.formaPagamento || 'Outro'}</span></td>
		`;
		tabelaCorpo.appendChild(tr);
	});
}
