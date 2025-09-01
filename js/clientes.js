document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('clienteForm');
	const tabela = document.querySelector('#clientesTable tbody');

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
		clientes.push({ nome, cpf, tel1, wpp1, tel2, wpp2, endereco });
		localStorage.setItem('clientes', JSON.stringify(clientes));

		atualizarTabela();
		form.reset();
	});

	function atualizarTabela() {
		const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
		tabela.innerHTML = '';
		clientes.forEach((c) => {
			const tr = document.createElement('tr');
			tr.innerHTML = `
        <td>${c.nome}</td>
        <td>${c.cpf}</td>
        <td>${c.tel1} (${c.wpp1})<br>${c.tel2} (${c.wpp2})</td>
        <td>${c.endereco}</td>
		<td><a class='btn' href="historico.html?cliente=${encodeURIComponent(
			c.nome,
		)}">Ver histórico</a></td>
      `;
			tabela.appendChild(tr);
		});
	}

	atualizarTabela();
});
