// Pega dados do localStorage
const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
const clientes = JSON.parse(localStorage.getItem('clientes')) || [];

// Elementos da página
const pedidoForm = document.getElementById('pedidoForm');
const pedidosTable = document.querySelector('#pedidosTable tbody');
const pedidoServico = document.getElementById('pedidoServico');
const pedidoData = document.getElementById('pedidoData');
const pedidoCliente = document.getElementById('pedidoCliente');
const sugestoesDiv = document.getElementById('sugestoesClientes');

// Atualizar tabela e select
function atualizarPedidos() {
	pedidosTable.innerHTML = '';

	pedidos.forEach((p) => {
		const tr = document.createElement('tr');
		tr.innerHTML = `
      <td>${p.cliente}</td>
      <td>${p.servicos}</td>
      <td>${p.data}</td>
      <td>R$ ${parseFloat(p.valor).toFixed(2)}</td>
      <td>${p.formaPagamento}</td>
    `;
		pedidosTable.appendChild(tr);
	});

	// Atualizar serviços no select
	if (pedidoServico) {
		pedidoServico.innerHTML = '';
		servicos.forEach((s) => {
			const option = document.createElement('option');
			option.value = s.nome;
			option.textContent = s.nome;
			pedidoServico.appendChild(option);
		});
	}
}

// Função para mostrar sugestões de clientes
pedidoCliente.addEventListener('input', () => {
	const termo = pedidoCliente.value.toLowerCase();
	sugestoesDiv.innerHTML = '';
	if (termo === '') return;

	const resultados = clientes.filter((c) =>
		c.nome.toLowerCase().includes(termo),
	);
	resultados.forEach((c) => {
		const div = document.createElement('div');
		div.textContent = c.nome + ' - ' + c.tel1;
		div.classList.add('sugestaoItem');
		div.addEventListener('click', () => {
			pedidoCliente.value = c.nome; // preenche o campo
			sugestoesDiv.innerHTML = ''; // limpa sugestões
		});
		sugestoesDiv.appendChild(div);
	});
});

// Cadastrar novo pedido
pedidoForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const clienteNome = document.getElementById('pedidoCliente').value;
	const servicosSelecionados = Array.from(pedidoServico.selectedOptions).map(
		(o) => o.value,
	);
	let data = document.getElementById('pedidoData').value;
	const valor = document.getElementById('pedidoValor').value;
	const formaPagamento = document.getElementById('formaPagamento').value;

	if (!data) {
		data = new Date().toISOString().split('T')[0];
	}

	const pedido = {
		cliente: clienteNome,
		servicos: servicosSelecionados.join(', '),
		data,
		valor,
		formaPagamento,
	};

	pedidos.push(pedido);
	localStorage.setItem('pedidos', JSON.stringify(pedidos));

	atualizarPedidos();
	pedidoForm.reset();
});

// Inicializar ao abrir página
atualizarPedidos();
