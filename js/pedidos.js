// Inicialização com serviços padrão caso esteja vazio pela primeira vez
if (!localStorage.getItem('servicos_initialized')) {
	const defaultServicos = [
		{ nome: 'Lavagem Simples', preco: 40.00, descricao: 'Lavagem externa com xampu neutro e secagem' },
		{ nome: 'Lavagem Completa', preco: 70.00, descricao: 'Lavagem externa, aspiração interna e pneus' },
		{ nome: 'Lavagem Completa + Cera', preco: 90.00, descricao: 'Lavagem completa com proteção de cera' },
		{ nome: 'Higienização Interna', preco: 180.00, descricao: 'Limpeza e desinfecção de estofados e carpetes' },
		{ nome: 'Polimento Comercial', preco: 250.00, descricao: 'Realce de brilho e remoção de marcas leves' }
	];
	if (!localStorage.getItem('servicos')) {
		localStorage.setItem('servicos', JSON.stringify(defaultServicos));
	}
	localStorage.setItem('servicos_initialized', 'true');
}

// Carrega dados do localStorage
let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
let servicos = JSON.parse(localStorage.getItem('servicos')) || [];
let clientes = JSON.parse(localStorage.getItem('clientes')) || [];

// Elementos da página
const pedidoForm = document.getElementById('pedidoForm');
const pedidosTable = document.querySelector('#pedidosTable tbody');
const pedidoServico = document.getElementById('pedidoServico');
const pedidoData = document.getElementById('pedidoData');
const pedidoCliente = document.getElementById('pedidoCliente');
const pedidoValor = document.getElementById('pedidoValor');
const sugestoesDiv = document.getElementById('sugestoesClientes');

// Preenche data atual por padrão
if (pedidoData && !pedidoData.value) {
	pedidoData.value = new Date().toISOString().split('T')[0];
}

// Atualizar tabela e opções de serviços
function atualizarPedidos() {
	// Recarrega do storage para sincronizar
	pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
	servicos = JSON.parse(localStorage.getItem('servicos')) || [];
	clientes = JSON.parse(localStorage.getItem('clientes')) || [];

	pedidosTable.innerHTML = '';

	if (pedidos.length === 0) {
		pedidosTable.innerHTML = `
			<tr>
				<td colspan="6" class="empty-table-message">
					Nenhum pedido registrado ainda. Preencha o formulário acima para criar uma Ordem de Serviço.
				</td>
			</tr>
		`;
	} else {
		// Mostrar pedidos mais recentes no topo
		const pedidosOrdenados = [...pedidos].reverse();
		pedidosOrdenados.forEach((p, reverseIndex) => {
			const originalIndex = pedidos.length - 1 - reverseIndex;
			const tr = document.createElement('tr');
			const valorFormatado = parseFloat(p.valor || 0).toFixed(2);
			tr.innerHTML = `
				<td><strong>${p.cliente || 'Sem Nome'}</strong></td>
				<td>${p.servicos || '-'}</td>
				<td>${p.data || '-'}</td>
				<td><span class="badge-price">R$ ${valorFormatado}</span></td>
				<td><span class="badge badge-payment">${p.formaPagamento || 'Outro'}</span></td>
				<td style="text-align: center;">
					<button type="button" class="btn btn-sm btn-secondary delete-pedido-btn" data-index="${originalIndex}" style="color: var(--danger);">
						🗑️ Excluir
					</button>
				</td>
			`;
			pedidosTable.appendChild(tr);
		});

		// Adiciona evento de exclusão
		document.querySelectorAll('.delete-pedido-btn').forEach((btn) => {
			btn.addEventListener('click', (e) => {
				const idx = e.currentTarget.getAttribute('data-index');
				const p = pedidos[idx];
				if (!p) return;

				if (confirm(`Excluir a ordem de serviço do cliente "${p.cliente}" de R$ ${p.valor}?`)) {
					pedidos.splice(idx, 1);
					localStorage.setItem('pedidos', JSON.stringify(pedidos));
					atualizarPedidos();
				}
			});
		});
	}

	// Atualizar serviços no select
	if (pedidoServico) {
		pedidoServico.innerHTML = '';
		if (servicos.length === 0) {
			const opt = document.createElement('option');
			opt.disabled = true;
			opt.textContent = 'Nenhum serviço cadastrado (Cadastre em Serviços)';
			pedidoServico.appendChild(opt);
		} else {
			servicos.forEach((s) => {
				const option = document.createElement('option');
				option.value = s.nome;
				const precoText = s.preco ? ` (R$ ${parseFloat(s.preco).toFixed(2)})` : '';
				option.textContent = `${s.nome}${precoText}`;
				option.dataset.preco = s.preco || 0;
				pedidoServico.appendChild(option);
			});
		}
	}
}

// Auto-cálculo de preço ao selecionar serviços
if (pedidoServico) {
	pedidoServico.addEventListener('change', () => {
		let total = 0;
		Array.from(pedidoServico.selectedOptions).forEach((opt) => {
			const preco = parseFloat(opt.dataset.preco) || 0;
			total += preco;
		});
		if (total > 0 && pedidoValor) {
			pedidoValor.value = total.toFixed(2);
		}
	});
}

// Função para mostrar sugestões de clientes no autocomplete
if (pedidoCliente && sugestoesDiv) {
	pedidoCliente.addEventListener('input', () => {
		const termo = pedidoCliente.value.trim().toLowerCase();
		sugestoesDiv.innerHTML = '';
		if (termo === '') return;

		const resultados = clientes.filter((c) =>
			c.nome && c.nome.toLowerCase().includes(termo),
		);

		if (resultados.length === 0) {
			const div = document.createElement('div');
			div.textContent = 'Nenhum cliente cadastrado com este nome';
			div.classList.add('sugestaoItem');
			div.style.color = 'var(--text-muted)';
			div.style.cursor = 'default';
			sugestoesDiv.appendChild(div);
			return;
		}

		resultados.forEach((c) => {
			const div = document.createElement('div');
			div.textContent = `${c.nome} ${c.tel1 ? '• ' + c.tel1 : ''}`;
			div.classList.add('sugestaoItem');
			div.addEventListener('click', () => {
				pedidoCliente.value = c.nome;
				sugestoesDiv.innerHTML = '';
			});
			sugestoesDiv.appendChild(div);
		});
	});

	// Fecha sugestões ao clicar fora
	document.addEventListener('click', (e) => {
		if (!pedidoCliente.contains(e.target) && !sugestoesDiv.contains(e.target)) {
			sugestoesDiv.innerHTML = '';
		}
	});
}

// Cadastrar novo pedido
pedidoForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const clienteNome = pedidoCliente.value.trim();
	const servicosSelecionados = Array.from(pedidoServico.selectedOptions)
		.filter((o) => !o.disabled)
		.map((o) => o.value);

	if (servicosSelecionados.length === 0) {
		alert('Por favor, selecione ao menos um serviço.');
		return;
	}

	let data = pedidoData.value;
	const valor = pedidoValor.value;
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
	if (pedidoData) {
		pedidoData.value = new Date().toISOString().split('T')[0];
	}
});

// Inicializar
atualizarPedidos();
