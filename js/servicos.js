const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
const servicoForm = document.getElementById('servicoForm');
const servicosTable = document.querySelector('#servicosTable tbody');

function atualizarServicos() {
	servicosTable.innerHTML = '';
	servicos.forEach((s) => {
		const tr = document.createElement('tr');
		tr.innerHTML = `<td>${s.nome}</td><td>R$ ${s.preco}</td><td>${s.descricao}</td>`;
		servicosTable.appendChild(tr);
	});
}

servicoForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const nome = document.getElementById('servicoNome').value;
	const preco = parseFloat(document.getElementById('servicoPreco').value) || 0;
	const descricao = document.getElementById('servicoDescricao').value;

	const servico = { nome, preco, descricao };
	servicos.push(servico);
	localStorage.setItem('servicos', JSON.stringify(servicos));
	atualizarServicos();
	servicoForm.reset();
});

atualizarServicos();
