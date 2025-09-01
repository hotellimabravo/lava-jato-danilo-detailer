const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
const hoje = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

let totalServicos = 0;
let totalValor = 0;

pedidos.forEach((p) => {
	if (p.data === hoje) {
		totalServicos++;
		totalValor += parseFloat(p.valor) || 0;
	}
});

document.getElementById(
	'totalServicos',
).textContent = `Serviços de hoje: ${totalServicos}`;
document.getElementById(
	'totalValor',
).textContent = `Valor produzido: R$ ${totalValor.toFixed(2)}`;
