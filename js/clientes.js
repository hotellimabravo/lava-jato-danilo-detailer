const inputNome = document.querySelector('#clienteNome');
const inputCPF = document.querySelector('#clienteCpf');
const inputTelefone1 = document.querySelector('#telefone1');
const inputTelefone2 = document.querySelector('#telefone2');
const inputWhatsApp1 = document.querySelector('#whatsapp1');
const inputWhatsApp2 = document.querySelector('#whatsapp2');
const inputEndereco = document.querySelector('#endereco');

document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('clienteForm');
	const tabela = document.querySelector('#clientesTable tbody');
	let editIndex = null; // Índice do cliente a ser editado

	form.addEventListener('submit', (e) => {
		e.preventDefault();

		const nome = document.getElementById('clienteNome').value;
		const cpf = document.getElementById('clienteCpf').value;
		const tel1 = document.getElementById('telefone1').value;
		const wpp1 = document.getElementById('whatsapp1').checked ? '✅' : '❌';
		const tel2 = document.getElementById('telefone2').value;
		const wpp2 = document.getElementById('whatsapp2').checked ? '✅' : '❌';
		const endereco = document.getElementById('endereco').value;

		const clientes = JSON.parse(localStorage.getItem('clientes')) || [];

		if (editIndex !== null) {
			// Editando cliente existente
			clientes[editIndex] = { nome, cpf, tel1, wpp1, tel2, wpp2, endereco };
			editIndex = null; // Limpa o índice após edição
		} else {
			// Adicionando novo cliente
			clientes.push({ nome, cpf, tel1, wpp1, tel2, wpp2, endereco });
		}

		localStorage.setItem('clientes', JSON.stringify(clientes));
		atualizarTabela();
		form.reset();
	});

	function atualizarTabela() {
		const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
		tabela.innerHTML = '';
		clientes.forEach((c, index) => {
			const tr = document.createElement('tr');
			tr.innerHTML = `
        <td id="nomeSalvo">${c.nome}</td>
        <td id="cpfSalvo">${c.cpf}</td>
        <td id="telefonesSalvos">${c.tel1} (${c.wpp1})<br>${c.tel2} (${
				c.wpp2
			})</td>
        <td id="enderecoSalvo">${c.endereco}</td>
        <td><a class='btn' href="historico.html?cliente=${encodeURIComponent(
					c.nome,
				)}">Ver histórico</a></td>
        <td><button class="edit__btn btn" data-index="${index}">Editar</button></td>
      `;
			tabela.appendChild(tr);
		});

		// Adiciona evento de edição
		const editButtons = document.querySelectorAll('.edit__btn');
		editButtons.forEach((button) => {
			button.addEventListener('click', (e) => {
				const index = e.target.getAttribute('data-index');
				const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
				console.log(clientes);
				const cliente = clientes[index];

				// Preenche o formulário com os dados do cliente
				inputNome.value = cliente.nome;
				inputCPF.value = cliente.cpf;
				inputTelefone1.value = cliente.tel1;
				inputWhatsApp1.checked = cliente.wpp1 === '✅';
				inputTelefone2.value = cliente.tel2;
				inputWhatsApp2.checked = cliente.wpp2 === '✅';
				inputEndereco.value = cliente.endereco;

				// Salva o índice para edição futura
				editIndex = index;
			});
		});
	}

	atualizarTabela();
});
