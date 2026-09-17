// ==========================================================================
// Gestão de Ordens de Serviço, Pátio e Encerramento
// ==========================================================================

// Inicialização com serviços padrão caso esteja vazio pela primeira vez
if (!localStorage.getItem('servicos_initialized')) {
	const defaultServicos = [
		{ nome: 'Lavagem Simples', preco: 40.0, descricao: 'Lavagem externa com xampu neutro e secagem' },
		{ nome: 'Lavagem Completa', preco: 70.0, descricao: 'Lavagem externa, aspiração interna e pneus' },
		{ nome: 'Lavagem Completa + Cera', preco: 90.0, descricao: 'Lavagem completa com proteção de cera' },
		{ nome: 'Higienização Interna', preco: 180.0, descricao: 'Limpeza e desinfecção de estofados e carpetes' },
		{ nome: 'Polimento Comercial', preco: 250.0, descricao: 'Realce de brilho e remoção de marcas leves' }
	];
	if (!localStorage.getItem('servicos')) {
		localStorage.setItem('servicos', JSON.stringify(defaultServicos));
	}
	localStorage.setItem('servicos_initialized', 'true');
}

// Elementos do DOM
const pedidoForm = document.getElementById('pedidoForm');
const pedidoCliente = document.getElementById('pedidoCliente');
const pedidoPlaca = document.getElementById('pedidoPlaca');
const pedidoCor = document.getElementById('pedidoCor');
const previewCorContainer = document.getElementById('previewCorContainer');
const pedidoModelo = document.getElementById('pedidoModelo');
const pedidoData = document.getElementById('pedidoData');
const pedidoOperador = document.getElementById('pedidoOperador');
const pedidoServico = document.getElementById('pedidoServico');
const pedidoValor = document.getElementById('pedidoValor');
const sugestoesDiv = document.getElementById('sugestoesClientes');

// Vistoria Checkboxes
const vistoriaPertences = document.getElementById('vistoriaPertences');
const vistoriaAvarias = document.getElementById('vistoriaAvarias');
const vistoriaVidros = document.getElementById('vistoriaVidros');
const vistoriaEstepe = document.getElementById('vistoriaEstepe');
const vistoriaObs = document.getElementById('vistoriaObs');

// Abas e visualizações
const tabPatioBtn = document.getElementById('tabPatioBtn');
const tabEncerradosBtn = document.getElementById('tabEncerradosBtn');
const viewPatio = document.getElementById('viewPatio');
const viewEncerrados = document.getElementById('viewEncerrados');
const countPatio = document.getElementById('countPatio');
const countEncerrados = document.getElementById('countEncerrados');
const corpoTabelaPatio = document.getElementById('corpoTabelaPatio');
const corpoTabelaEncerrados = document.getElementById('corpoTabelaEncerrados');

// Modal de Encerramento
const modalEncerramento = document.getElementById('modalEncerramento');
const formEncerramento = document.getElementById('formEncerramento');
const modalTitulo = document.getElementById('modalTitulo');
const modalDetalhesVeiculo = document.getElementById('modalDetalhesVeiculo');
const modalDetalhesCliente = document.getElementById('modalDetalhesCliente');
const modalDetalhesServicos = document.getElementById('modalDetalhesServicos');
const modalValorFinal = document.getElementById('modalValorFinal');
const modalFormaPagamento = document.getElementById('modalFormaPagamento');
const modalFecharBtn = document.getElementById('modalFecharBtn');
const modalCancelarBtn = document.getElementById('modalCancelarBtn');
const modalCheckImprimirRecibo = document.getElementById('modalCheckImprimirRecibo');

// Modal de Recibo Cupom Fiscal
const modalRecibo = document.getElementById('modalRecibo');
const modalReciboConteudo = document.getElementById('modalReciboConteudo');
const modalReciboTitulo = document.getElementById('modalReciboTitulo');
const modalReciboFecharBtn = document.getElementById('modalReciboFecharBtn');
const modalReciboFecharInferiorBtn = document.getElementById('modalReciboFecharInferiorBtn');
const modalReciboImprimirBtn = document.getElementById('modalReciboImprimirBtn');
const modalReciboBaixarBtn = document.getElementById('modalReciboBaixarBtn');

let pedidoSelecionadoParaRecibo = null;
let pedidoSelecionadoParaEncerrar = null;

// Normalização de dados legados no carregamento
function normalizarDadosPedidos() {
	const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
	let houveModificacao = false;

	pedidos.forEach((p, idx) => {
		if (!p.id) {
			p.id = 'os_' + (Date.now() - (pedidos.length - idx) * 1000);
			houveModificacao = true;
		}
		if (!p.status) {
			// Se já tinha forma de pagamento, é legado encerrado
			p.status = p.formaPagamento ? 'encerrado' : 'aberto';
			houveModificacao = true;
		}
		if (!p.placa) {
			p.placa = 'SEM PLACA';
			houveModificacao = true;
		}
		if (!p.cor) {
			p.cor = 'prata';
			houveModificacao = true;
		}
	});

	if (houveModificacao) {
		localStorage.setItem('pedidos', JSON.stringify(pedidos));
	}
}

// Popular seletor de cores do veículo
function popularCoresVeiculo() {
	if (!pedidoCor) return;
	pedidoCor.innerHTML = '';
	
	CORES_VEICULOS.forEach((c) => {
		const opt = document.createElement('option');
		opt.value = c.id;
		opt.textContent = `${c.nome}`;
		pedidoCor.appendChild(opt);
	});

	pedidoCor.addEventListener('change', atualizarPreviewCor);
	atualizarPreviewCor();
}

function atualizarPreviewCor() {
	if (!pedidoCor || !previewCorContainer) return;
	const corId = pedidoCor.value;
	const corObj = obterCorVeiculo(corId);
	previewCorContainer.innerHTML = `
		${renderizarIconeCarro(corObj, 24)}
		<small style="font-weight:600; color:var(--text-muted);">${corObj.nome}</small>
	`;
}

// Data atual padrão
if (pedidoData && !pedidoData.value) {
	pedidoData.value = obterDataHojeISO();
}

// Formatação automática da placa para maiúsculas
if (pedidoPlaca) {
	pedidoPlaca.addEventListener('input', (e) => {
		let v = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
		e.target.value = v;
	});
}

// Atualiza a lista de opções de serviços no select
function carregarSelectServicos() {
	const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
	if (!pedidoServico) return;

	pedidoServico.innerHTML = '';
	if (servicos.length === 0) {
		const opt = document.createElement('option');
		opt.disabled = true;
		opt.textContent = 'Nenhum serviço cadastrado';
		pedidoServico.appendChild(opt);
	} else {
		servicos.forEach((s) => {
			const opt = document.createElement('option');
			opt.value = s.nome;
			const precoFmt = s.preco ? ` (R$ ${parseFloat(s.preco).toFixed(2)})` : '';
			opt.textContent = `${s.nome}${precoFmt}`;
			opt.dataset.preco = s.preco || 0;
			pedidoServico.appendChild(opt);
		});
	}
}

// Cálculo automático de preço ao selecionar serviços
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

// Autocomplete de clientes (por Nome ou Telefone/Código)
if (pedidoCliente && sugestoesDiv) {
	pedidoCliente.addEventListener('input', () => {
		const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
		const termo = pedidoCliente.value.trim().toLowerCase();
		const termoApenasDigitos = termo.replace(/\D/g, '');
		sugestoesDiv.innerHTML = '';
		if (termo === '') return;

		const resultados = clientes.filter((c) => {
			const nomeMatch = c.nome && c.nome.toLowerCase().includes(termo);
			const tel1Limpo = (c.tel1 || '').replace(/\D/g, '');
			const tel2Limpo = (c.tel2 || '').replace(/\D/g, '');
			const telMatch = termoApenasDigitos.length > 0 && (
				tel1Limpo.includes(termoApenasDigitos) || tel2Limpo.includes(termoApenasDigitos)
			);
			return nomeMatch || telMatch;
		});

		if (resultados.length === 0) {
			const div = document.createElement('div');
			div.textContent = 'Nenhum cliente cadastrado com este nome ou telefone';
			div.classList.add('sugestaoItem');
			div.style.color = 'var(--text-muted)';
			div.style.cursor = 'default';
			sugestoesDiv.appendChild(div);
			return;
		}

		resultados.forEach((c) => {
			const div = document.createElement('div');
			const telDestaque = c.tel1 ? ` • 📞 ${c.tel1}` : '';
			div.innerHTML = `<strong>${c.nome}</strong>${telDestaque}`;
			div.classList.add('sugestaoItem');
			div.addEventListener('click', () => {
				pedidoCliente.value = c.nome;
				sugestoesDiv.innerHTML = '';
			});
			sugestoesDiv.appendChild(div);
		});
	});

	document.addEventListener('click', (e) => {
		if (!pedidoCliente.contains(e.target) && !sugestoesDiv.contains(e.target)) {
			sugestoesDiv.innerHTML = '';
		}
	});
}

// Alternar abas Pátio x Encerrados
if (tabPatioBtn && tabEncerradosBtn) {
	tabPatioBtn.addEventListener('click', () => {
		tabPatioBtn.classList.add('active');
		tabEncerradosBtn.classList.remove('active');
		viewPatio.style.display = 'block';
		viewEncerrados.style.display = 'none';
	});

	tabEncerradosBtn.addEventListener('click', () => {
		tabEncerradosBtn.classList.add('active');
		tabPatioBtn.classList.remove('active');
		viewPatio.style.display = 'none';
		viewEncerrados.style.display = 'block';
	});
}

// Renderização das Tabelas (Pátio e Encerrados)
function renderizarTabelas() {
	const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
	
	const pedidosPatio = pedidos.filter((p) => p.status === 'aberto');
	const pedidosEncerrados = pedidos.filter((p) => p.status === 'encerrado');

	if (countPatio) countPatio.textContent = pedidosPatio.length;
	if (countEncerrados) countEncerrados.textContent = pedidosEncerrados.length;

	// Renderizar Pátio (Em Aberto)
	corpoTabelaPatio.innerHTML = '';
	if (pedidosPatio.length === 0) {
		corpoTabelaPatio.innerHTML = `
			<tr>
				<td colspan="6" class="empty-table-message">
					🅿️ Nenhum veículo em atendimento no pátio no momento. Preencha o formulário acima para dar entrada.
				</td>
			</tr>
		`;
	} else {
		// Mostrar mais recentes primeiro
		[...pedidosPatio].reverse().forEach((p) => {
			const corObj = obterCorVeiculo(p.cor);
			const tr = document.createElement('tr');
			const valorFormatado = parseFloat(p.valor || 0).toFixed(2);
			const modeloTexto = p.modelo ? ` • ${p.modelo}` : '';

			const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
			const cliObj = clientes.find(c => c.nome && c.nome.toLowerCase() === (p.cliente || '').toLowerCase());
			const telLimpo = cliObj && cliObj.tel1 ? cliObj.tel1.replace(/\D/g, '') : '';
			const msgWhats = encodeURIComponent(
				`Olá ${p.cliente}! 🚗✨\n\n` +
				`Seu veículo ${p.modelo || ''} (${p.placa}) já foi finalizado e está pronto para retirada no Danilo Detailer!\n\n` +
				`Serviços realizados: ${p.servicos}\n` +
				`Valor total: R$ ${valorFormatado}\n\n` +
				`Aguardamos você!`
			);
			const linkWhatsPronto = telLimpo ? `https://wa.me/55${telLimpo}?text=${msgWhats}` : '';

			tr.innerHTML = `
				<td>
					<div class="veiculo-info-cell">
						${renderizarIconeCarro(corObj, 32)}
						<div class="veiculo-meta">
							<span class="badge-placa">${p.placa || 'SEM PLACA'}</span>
							<span class="veiculo-cor-nome">${corObj.nome}${modeloTexto}</span>
						</div>
					</div>
				</td>
				<td>
					<strong>${p.cliente || 'Não identificado'}</strong>
					${p.operadorNome ? `<small style="display:block; color:var(--text-muted);">👤 Resp: ${p.operadorNome}</small>` : ''}
				</td>
				<td>
					<div>${p.data || '-'}</div>
					<small style="color:var(--text-muted);">${p.horaEntrada ? 'Chegada: ' + p.horaEntrada : ''}</small>
				</td>
				<td>${p.servicos || '-'}</td>
				<td>
					<span class="badge-price">R$ ${valorFormatado}</span>
					<div><span class="badge badge-status badge-status-aberto">Em Andamento</span></div>
				</td>
				<td style="text-align: center;">
					<div class="btn-action-group" style="flex-wrap:wrap; justify-content:center;">
						${linkWhatsPronto ? `
							<a href="${linkWhatsPronto}" target="_blank" class="btn btn-sm" style="background:#16a34a; color:#fff;" title="Avisar cliente no WhatsApp que o carro está pronto">
								💬 Carro Pronto
							</a>
						` : ''}
						<button type="button" class="btn btn-sm btn-receber-os" data-id="${p.id}" style="background-color: var(--success); color: #fff;">
							💰 Receber
						</button>
						<button type="button" class="btn btn-sm btn-secondary btn-cancelar-os" data-id="${p.id}" style="color: var(--danger);" title="Remover O.S.">
							🗑️
						</button>
					</div>
				</td>
			`;
			corpoTabelaPatio.appendChild(tr);
		});
	}

	// Renderizar Encerrados
	corpoTabelaEncerrados.innerHTML = '';
	if (pedidosEncerrados.length === 0) {
		corpoTabelaEncerrados.innerHTML = `
			<tr>
				<td colspan="7" class="empty-table-message">
					Nenhuma ordem de serviço encerrada ainda.
				</td>
			</tr>
		`;
	} else {
		[...pedidosEncerrados].reverse().forEach((p) => {
			const corObj = obterCorVeiculo(p.cor);
			const tr = document.createElement('tr');
			const valorFormatado = parseFloat(p.valor || 0).toFixed(2);
			const modeloTexto = p.modelo ? ` • ${p.modelo}` : '';
			const dataSaida = p.dataEncerramento || p.data || '-';
			const horaSaida = p.horaEncerramento ? ` às ${p.horaEncerramento}` : '';

			tr.innerHTML = `
				<td>
					<div class="veiculo-info-cell">
						${renderizarIconeCarro(corObj, 30)}
						<div class="veiculo-meta">
							<span class="badge-placa">${p.placa || 'SEM PLACA'}</span>
							<span class="veiculo-cor-nome">${corObj.nome}${modeloTexto}</span>
						</div>
					</div>
				</td>
				<td><strong>${p.cliente || 'Não identificado'}</strong></td>
				<td>
					<div>${dataSaida}</div>
					<small style="color:var(--text-muted);">${horaSaida}</small>
				</td>
				<td>${p.servicos || '-'}</td>
				<td><span class="badge-price">R$ ${valorFormatado}</span></td>
				<td>
					<span class="badge badge-payment">${p.formaPagamento || 'Outro'}</span>
				</td>
				<td style="text-align: center;">
					<div style="display: inline-flex; align-items: center; gap: 6px;">
						<button type="button" class="btn btn-sm btn-recibo-os" data-id="${p.id}" title="Ver e Imprimir Recibo Estilo Cupom Fiscal">
							🧾 Recibo
						</button>
						<button type="button" class="btn btn-sm btn-secondary btn-cancelar-os" data-id="${p.id}" style="color: var(--danger);" title="Excluir Registro">
							🗑️
						</button>
					</div>
				</td>
			`;
			corpoTabelaEncerrados.appendChild(tr);
		});
	}

	// Vincular eventos de Visualizar/Imprimir Recibo
	document.querySelectorAll('.btn-recibo-os').forEach((btn) => {
		btn.addEventListener('click', (e) => {
			const osId = e.currentTarget.getAttribute('data-id');
			abrirModalRecibo(osId);
		});
	});

	// Vincular eventos de Receber & Encerrar
	document.querySelectorAll('.btn-receber-os').forEach((btn) => {
		btn.addEventListener('click', (e) => {
			const osId = e.currentTarget.getAttribute('data-id');
			abrirModalEncerramento(osId);
		});
	});

	// Vincular eventos de Cancelar/Excluir
	document.querySelectorAll('.btn-cancelar-os').forEach((btn) => {
		btn.addEventListener('click', (e) => {
			const osId = e.currentTarget.getAttribute('data-id');
			const todosPedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
			const p = todosPedidos.find((item) => item.id === osId);
			if (!p) return;

			if (confirm(`Deseja realmente remover o registro da O.S. da placa "${p.placa}" (${p.cliente})?`)) {
				const atualizados = todosPedidos.filter((item) => item.id !== osId);
				localStorage.setItem('pedidos', JSON.stringify(atualizados));
				renderizarTabelas();
			}
		});
	});
}

// Modal de Encerramento e Pagamento
function abrirModalEncerramento(osId) {
	const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
	const p = pedidos.find((item) => item.id === osId);
	if (!p) return;

	pedidoSelecionadoParaEncerrar = p;
	const corObj = obterCorVeiculo(p.cor);

	if (modalTitulo) modalTitulo.textContent = `Receber O.S. - Placa ${p.placa}`;
	if (modalDetalhesVeiculo) {
		modalDetalhesVeiculo.innerHTML = `
			${renderizarIconeCarro(corObj, 28)}
			<div>
				<strong class="badge-placa">${p.placa}</strong> 
				<span style="font-size:0.85rem; color:var(--text-muted); margin-left:6px;">${corObj.nome} ${p.modelo ? '• ' + p.modelo : ''}</span>
			</div>
		`;
	}

	if (modalDetalhesCliente) {
		modalDetalhesCliente.innerHTML = `👤 Cliente: <strong>${p.cliente}</strong> (Entrada: ${p.data} às ${p.horaEntrada || '--:--'})`;
	}

	if (modalDetalhesServicos) {
		modalDetalhesServicos.innerHTML = `🛠️ Serviços: <strong>${p.servicos}</strong>`;
	}

	if (modalValorFinal) {
		modalValorFinal.value = parseFloat(p.valor || 0).toFixed(2);
	}

	if (modalFormaPagamento) {
		modalFormaPagamento.value = 'Pix';
	}

	modalEncerramento.classList.add('open');
}

function fecharModalEncerramento() {
	modalEncerramento.classList.remove('open');
	pedidoSelecionadoParaEncerrar = null;
}

if (modalFecharBtn) modalFecharBtn.addEventListener('click', fecharModalEncerramento);
if (modalCancelarBtn) modalCancelarBtn.addEventListener('click', fecharModalEncerramento);

// Submissão do Encerramento
if (formEncerramento) {
	formEncerramento.addEventListener('submit', (e) => {
		e.preventDefault();
		if (!pedidoSelecionadoParaEncerrar) return;

		const valorFinal = parseFloat(modalValorFinal.value) || 0;
		const formaPagamento = modalFormaPagamento.value;
		const hoje = obterDataHojeISO();
		const horaAtual = obterHoraAtual();

		const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
		const index = pedidos.findIndex((item) => item.id === pedidoSelecionadoParaEncerrar.id);

		let pedidoEncerradoFinal = null;

		if (index !== -1) {
			pedidos[index].status = 'encerrado';
			pedidos[index].valor = valorFinal;
			pedidos[index].formaPagamento = formaPagamento;
			pedidos[index].dataEncerramento = hoje;
			pedidos[index].horaEncerramento = horaAtual;

			pedidoEncerradoFinal = pedidos[index];
			localStorage.setItem('pedidos', JSON.stringify(pedidos));
		}

		const deveImprimirRecibo = !modalCheckImprimirRecibo || modalCheckImprimirRecibo.checked;

		fecharModalEncerramento();
		renderizarTabelas();

		// Alterna para a aba de encerrados para feedback imediato
		if (tabEncerradosBtn) tabEncerradosBtn.click();

		// Abre imediatamente o recibo / cupom fiscal para visualização e impressão
		if (pedidoEncerradoFinal && deveImprimirRecibo) {
			abrirModalRecibo(pedidoEncerradoFinal.id);
		}
	});
}

// Funções de Abertura, Visualização e Impressão do Recibo Cupom Fiscal
function abrirModalRecibo(osId) {
	const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
	const p = pedidos.find((item) => item.id === osId);
	if (!p) return;

	pedidoSelecionadoParaRecibo = p;

	const numOS = (p.id || '').replace(/^os_/, '').slice(-6) || '000001';
	if (modalReciboTitulo) {
		modalReciboTitulo.textContent = `Recibo / Cupom Fiscal - O.S. #${numOS}`;
	}

	if (modalReciboConteudo && typeof ReciboService !== 'undefined') {
		modalReciboConteudo.innerHTML = ReciboService.gerarCupomHTML(p);
	}

	if (modalRecibo) {
		modalRecibo.classList.add('open');
	}
}

function fecharModalRecibo() {
	if (modalRecibo) {
		modalRecibo.classList.remove('open');
	}
	pedidoSelecionadoParaRecibo = null;
}

if (modalReciboFecharBtn) modalReciboFecharBtn.addEventListener('click', fecharModalRecibo);
if (modalReciboFecharInferiorBtn) modalReciboFecharInferiorBtn.addEventListener('click', fecharModalRecibo);

if (modalReciboImprimirBtn) {
	modalReciboImprimirBtn.addEventListener('click', () => {
		if (pedidoSelecionadoParaRecibo && typeof ReciboService !== 'undefined') {
			ReciboService.imprimirCupom(pedidoSelecionadoParaRecibo);
		}
	});
}

if (modalReciboBaixarBtn) {
	modalReciboBaixarBtn.addEventListener('click', async () => {
		if (pedidoSelecionadoParaRecibo && typeof ReciboService !== 'undefined') {
			const textoOriginal = modalReciboBaixarBtn.innerHTML;
			modalReciboBaixarBtn.innerHTML = '⏳ Gerando...';
			modalReciboBaixarBtn.disabled = true;
			try {
				await ReciboService.baixarImagemRecibo(pedidoSelecionadoParaRecibo);
			} finally {
				modalReciboBaixarBtn.innerHTML = textoOriginal;
				modalReciboBaixarBtn.disabled = false;
			}
		}
	});
}

function popularSelectOperadores() {
	if (!pedidoOperador || typeof EquipeService === 'undefined') return;
	const membros = EquipeService.getMembros();
	pedidoOperador.innerHTML = '<option value="">Selecione quem executará o serviço...</option>';
	membros.forEach((m) => {
		const opt = document.createElement('option');
		opt.value = m.id;
		opt.textContent = `${m.nome} (${m.cargo || 'Lavador'})`;
		pedidoOperador.appendChild(opt);
	});
}

// Formulário de Entrada do Veículo (Abrir O.S.)
if (pedidoForm) {
	pedidoForm.addEventListener('submit', (e) => {
		e.preventDefault();

		const clienteNome = pedidoCliente.value.trim();
		const placa = pedidoPlaca.value.trim().toUpperCase();
		const cor = pedidoCor.value;
		const modelo = pedidoModelo.value.trim();
		const valor = parseFloat(pedidoValor.value) || 0;
		let data = pedidoData.value;
		if (!data) data = obterDataHojeISO();

		const operadorId = pedidoOperador ? pedidoOperador.value : '';
		let operadorNome = '';
		if (operadorId && typeof EquipeService !== 'undefined') {
			const m = EquipeService.getMembros().find(x => x.id === operadorId);
			if (m) operadorNome = m.nome;
		}

		const servicosSelecionados = Array.from(pedidoServico.selectedOptions)
			.filter((o) => !o.disabled)
			.map((o) => o.value);

		if (servicosSelecionados.length === 0) {
			alert('Por favor, selecione ao menos um serviço para o atendimento.');
			return;
		}

		// Se o cliente ainda não estiver cadastrado na base de clientes, sugerimos salvar
		const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
		const clienteExiste = clientes.some((c) => c.nome.toLowerCase() === clienteNome.toLowerCase());
		if (!clienteExiste && clienteNome) {
			clientes.push({
				nome: clienteNome,
				tel1: '',
				wpp1: '❌',
				tel2: '',
				wpp2: '❌',
				endereco: ''
			});
			localStorage.setItem('clientes', JSON.stringify(clientes));
		}

		const osId = 'os_' + Date.now();

		// Salva checklist de vistoria
		if (typeof VistoriaService !== 'undefined') {
			VistoriaService.salvarVistoria(osId, {
				pertences: vistoriaPertences ? vistoriaPertences.checked : true,
				avarias: vistoriaAvarias ? vistoriaAvarias.checked : false,
				vidros: vistoriaVidros ? vistoriaVidros.checked : true,
				estepe: vistoriaEstepe ? vistoriaEstepe.checked : true,
				observacoes: vistoriaObs ? vistoriaObs.value.trim() : ''
			});
		}

		const novoPedido = {
			id: osId,
			cliente: clienteNome,
			placa: placa,
			cor: cor,
			modelo: modelo,
			servicos: servicosSelecionados.join(', '),
			operadorId: operadorId,
			operadorNome: operadorNome,
			data: data,
			horaEntrada: obterHoraAtual(),
			valor: valor,
			status: 'aberto', // Veículo entra no pátio com O.S. aberta
			formaPagamento: '',
			dataEncerramento: '',
			horaEncerramento: ''
		};

		const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
		pedidos.push(novoPedido);
		localStorage.setItem('pedidos', JSON.stringify(pedidos));

		// Limpa formulário
		pedidoForm.reset();
		if (pedidoData) pedidoData.value = obterDataHojeISO();
		popularCoresVeiculo();
		popularSelectOperadores();
		renderizarTabelas();

		// Rola até o pátio e garante a aba ativa
		if (tabPatioBtn) tabPatioBtn.click();
	});
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
	normalizarDadosPedidos();
	popularCoresVeiculo();
	carregarSelectServicos();
	popularSelectOperadores();
	renderizarTabelas();
});
