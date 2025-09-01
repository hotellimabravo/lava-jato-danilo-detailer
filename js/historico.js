const params = new URLSearchParams(window.location.search);
const clienteNome = params.get('cliente');
document.getElementById('clienteNome').textContent = clienteNome;

// Pegar pedidos do localStorage
const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
const historicoTable = document.querySelector('#historicoTable tbody');

// Filtrar pedidos do cliente
const historico = pedidos.filter(
	(p) => p.cliente.toLowerCase() === clienteNome.toLowerCase(),
);

// Preencher tabela
historico.forEach((p) => {
	const tr = document.createElement('tr');
	tr.innerHTML = `<td>${p.data}</td><td>${p.servicos}</td><td>${p.formaPagamento}</td>`;
	historicoTable.appendChild(tr);
});
