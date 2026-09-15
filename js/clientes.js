const inputNome = document.querySelector('#clienteNome');
const inputCPF = document.querySelector('#clienteCpf');
const inputTelefone1 = document.querySelector('#telefone1');
const inputTelefone2 = document.querySelector('#telefone2');
const inputWhatsApp1 = document.querySelector('#whatsapp1');
const inputWhatsApp2 = document.querySelector('#whatsapp2');
const inputEndereco = document.querySelector('#endereco');
const formCardTitle = document.querySelector('#formCardTitle');
const btnCancelarEdicao = document.querySelector('#btnCancelarEdicao');
const btnSalvar = document.querySelector('#btnSalvarCliente');

document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('clienteForm');
	const tabela = document.querySelector('#clientesTable tbody');
	let editIndex = null; // Índice do cliente a ser editado

	function resetFormState() {
		editIndex = null;
		form.reset();
		if (formCardTitle) formCardTitle.textContent = 'Novo Cliente';
		if (btnSalvar) btnSalvar.textContent = '💾 Salvar Cliente';
		if (btnCancelarEdicao) btnCancelarEdicao.style.display = 'none';
	}

	if (btnCancelarEdicao) {
		btnCancelarEdicao.addEventListener('click', () => {
			resetFormState();
		});
	}

	form.addEventListener('submit', (e) => {
		e.preventDefault();

		const nome = inputNome.value.trim();
		const cpf = inputCPF.value.trim();
		const tel1 = inputTelefone1.value.trim();
		const wpp1 = inputWhatsApp1.checked ? '✅' : '❌';
		const tel2 = inputTelefone2.value.trim();
		const wpp2 = inputWhatsApp2.checked ? '✅' : '❌';
		const endereco = inputEndereco.value.trim();

		const clientes = JSON.parse(localStorage.getItem('clientes')) || [];

		if (editIndex !== null) {
			// Editando cliente existente
			clientes[editIndex] = { nome, cpf, tel1, wpp1, tel2, wpp2, endereco };
			editIndex = null;
		} else {
			// Adicionando novo cliente
			clientes.push({ nome, cpf, tel1, wpp1, tel2, wpp2, endereco });
		}

		localStorage.setItem('clientes', JSON.stringify(clientes));
		atualizarTabela();
		resetFormState();
	});

	function atualizarTabela() {
		const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
		tabela.innerHTML = '';

		if (clientes.length === 0) {
			tabela.innerHTML = `
				<tr>
					<td colspan="6" class="empty-table-message">
						Nenhum cliente cadastrado ainda. Use o formulário acima para cadastrar o primeiro cliente.
					</td>
				</tr>
			`;
			return;
		}

		clientes.forEach((c, index) => {
			const tr = document.createElement('tr');
			
			const tel1Html = c.tel1 
				? `${c.tel1} ${c.wpp1 === '✅' ? '<span class="badge badge-whatsapp">WhatsApp</span>' : ''}` 
				: '-';
			const tel2Html = c.tel2 
				? `<br><small style="color:var(--text-muted);">${c.tel2} ${c.wpp2 === '✅' ? '<span class="badge badge-whatsapp">WhatsApp</span>' : ''}</small>` 
				: '';

			tr.innerHTML = `
				<td id="nomeSalvo"><strong>${c.nome || '-'}</strong></td>
				<td id="cpfSalvo">${c.cpf || '-'}</td>
				<td id="telefonesSalvos">${tel1Html}${tel2Html}</td>
				<td id="enderecoSalvo">${c.endereco || '<span style="color:var(--text-muted);">-</span>'}</td>
				<td style="text-align: center;">
					<a class="btn btn-secondary btn-sm" href="historico.html?cliente=${encodeURIComponent(c.nome)}">
						📜 Histórico
					</a>
				</td>
				<td style="text-align: center;">
					<div class="btn-action-group">
						<button type="button" class="edit__btn btn btn-sm" data-index="${index}">
							✏️ Editar
						</button>
						<button type="button" class="delete__btn btn btn-sm btn-secondary" data-index="${index}" style="color: var(--danger);">
							🗑️
						</button>
					</div>
				</td>
			`;
			tabela.appendChild(tr);
		});

		// Adiciona evento de edição
		const editButtons = document.querySelectorAll('.edit__btn');
		editButtons.forEach((button) => {
			button.addEventListener('click', (e) => {
				const index = e.currentTarget.getAttribute('data-index');
				const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
				const cliente = clientes[index];
				if (!cliente) return;

				// Preenche o formulário com os dados do cliente
				inputNome.value = cliente.nome || '';
				inputCPF.value = cliente.cpf || '';
				inputTelefone1.value = cliente.tel1 || '';
				inputWhatsApp1.checked = cliente.wpp1 === '✅';
				inputTelefone2.value = cliente.tel2 || '';
				inputWhatsApp2.checked = cliente.wpp2 === '✅';
				inputEndereco.value = cliente.endereco || '';

				editIndex = index;
				if (formCardTitle) formCardTitle.textContent = `Editando: ${cliente.nome}`;
				if (btnSalvar) btnSalvar.textContent = '💾 Atualizar Cliente';
				if (btnCancelarEdicao) btnCancelarEdicao.style.display = 'inline-flex';

				// Rola suavemente até o formulário no mobile
				window.scrollTo({ top: 0, behavior: 'smooth' });
			});
		});

		// Adiciona evento de exclusão
		const deleteButtons = document.querySelectorAll('.delete__btn');
		deleteButtons.forEach((button) => {
			button.addEventListener('click', (e) => {
				const index = e.currentTarget.getAttribute('data-index');
				const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
				const cliente = clientes[index];
				if (!cliente) return;

				if (confirm(`Deseja realmente remover o cliente "${cliente.nome}"?`)) {
					clientes.splice(index, 1);
					localStorage.setItem('clientes', JSON.stringify(clientes));
					if (editIndex === index) {
						resetFormState();
					}
					atualizarTabela();
				}
			});
		});
	}

	atualizarTabela();
});
