// Carregar dados do localStorage
const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];

document.getElementById('totalClientes').textContent = clientes.length;
document.getElementById('totalServicos').textContent = servicos.length;
document.getElementById('totalPedidos').textContent = pedidos.length;
