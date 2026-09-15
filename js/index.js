// Carrega dados do localStorage
const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
const hoje = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

let totalServicosHoje = 0;
let totalValorHoje = 0;

pedidos.forEach((p) => {
	if (p.data === hoje) {
		totalServicosHoje++;
		totalValorHoje += parseFloat(p.valor) || 0;
	}
});

// Atualiza os contadores principais
const elTotalServicos = document.getElementById('totalServicos');
if (elTotalServicos) {
	elTotalServicos.textContent = totalServicosHoje;
}

const elTotalValor = document.getElementById('totalValor');
if (elTotalValor) {
	elTotalValor.textContent = `R$ ${totalValorHoje.toFixed(2)}`;
}

const elTotalClientes = document.getElementById('totalClientes');
if (elTotalClientes) {
	elTotalClientes.textContent = clientes.length;
}

// Preenche lista de pedidos recentes
const listaHojeCorpo = document.getElementById('listaHojeCorpo');
if (listaHojeCorpo) {
	if (pedidos.length === 0) {
		listaHojeCorpo.innerHTML = `
			<tr>
				<td colspan="5" class="empty-table-message">
					Nenhum pedido registrado ainda. <a href="pedidos.html" style="color: var(--primary); font-weight:600;">Clique aqui para criar o primeiro</a>.
				</td>
			</tr>
		`;
	} else {
		// Pega os últimos 5 pedidos (ordem decrescente)
		const ultimos = [...pedidos].reverse().slice(0, 5);
		listaHojeCorpo.innerHTML = '';
		ultimos.forEach((p) => {
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td><strong>${p.cliente || 'Sem nome'}</strong></td>
				<td>${p.servicos || '-'}</td>
				<td><span class="badge-price">R$ ${parseFloat(p.valor || 0).toFixed(2)}</span></td>
				<td><span class="badge badge-payment">${p.formaPagamento || 'Outro'}</span></td>
				<td>${p.data || hoje}</td>
			`;
			listaHojeCorpo.appendChild(tr);
		});
	}
}
