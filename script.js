const clientes = [];
const servicos = [];
const pedidos = [];

// --- Clientes ---
const clienteForm = document.getElementById('clienteForm');
const clientesTable = document.querySelector('#clientesTable tbody');

clienteForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const cliente = {
		nome: document.getElementById('nome').value,
		cpf: document.getElementById('cpf').value,
		telefone1: document.getElementById('telefone1').value,
		whatsapp1: document.getElementById('whatsapp1').checked,
		telefone2: document.getElementById('telefone2').value,
		whatsapp2: document.getElementById('whatsapp2').checked,
		endereco: document.getElementById('endereco').value,
	};
	clientes.push(cliente);
	atualizarClientes();
	clienteForm.reset();
});

function atualizarClientes() {
	clientesTable.innerHTML = '';
	clientes.forEach((c) => {
		const tr = document.createElement('tr');
		tr.innerHTML = `<td>${c.nome}</td><td>${c.cpf}</td><td>${c.telefone1} ${
			c.whatsapp1 ? '📱' : ''
		}</td><td>${c.telefone2} ${c.whatsapp2 ? '📱' : ''}</td><td>${
			c.endereco
		}</td>`;
		clientesTable.appendChild(tr);
	});
}

// --- Serviços ---
const servicoForm = document.getElementById('servicoForm');
const servicosTable = document.querySelector('#servicosTable tbody');
const pedidoServico = document.getElementById('pedidoServico');

servicoForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const servico = {
		nome: document.getElementById('servicoNome').value,
		descricao: document.getElementById('descricao').value,
		preco: document.getElementById('preco').value,
	};
	servicos.push(servico);
	atualizarServicos();
	servicoForm.reset();
});

function atualizarServicos() {
	servicosTable.innerHTML = '';
	pedidoServico.innerHTML = '';
	servicos.forEach((s) => {
		const tr = document.createElement('tr');
		tr.innerHTML = `<td>${s.nome}</td><td>${s.descricao}</td><td>${s.preco}</td>`;
		servicosTable.appendChild(tr);

		const option = document.createElement('option');
		option.value = s.nome;
		option.textContent = s.nome;
		pedidoServico.appendChild(option);
	});
}

// --- Pedidos ---
const pedidoForm = document.getElementById('pedidoForm');
const pedidosTable = document.querySelector('#pedidosTable tbody');

pedidoForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const clienteNome = document.getElementById('pedidoCliente').value;
	const cliente = clientes.find(
		(c) => c.nome.toLowerCase() === clienteNome.toLowerCase(),
	);
	if (!cliente) {
		alert('Cliente não encontrado');
		return;
	}

	const servicosSelecionados = Array.from(pedidoServico.selectedOptions).map(
		(o) => o.value,
	);
	const formaPagamento = document.getElementById('formaPagamento').value;

	const pedido = {
		cliente: cliente.nome,
		servicos: servicosSelecionados.join(', '),
		formaPagamento,
	};
	pedidos.push(pedido);
	atualizarPedidos();
	pedidoForm.reset();
});

function atualizarPedidos() {
	pedidosTable.innerHTML = '';
	pedidos.forEach((p) => {
		const tr = document.createElement('tr');
		tr.innerHTML = `<td>${p.cliente}</td><td>${p.servicos}</td><td>${p.formaPagamento}</td>`;
		pedidosTable.appendChild(tr);
	});
}
