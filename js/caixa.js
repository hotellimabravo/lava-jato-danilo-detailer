// ==========================================================================
// Lógica do Livro Caixa e Fechamento Diário
// ==========================================================================

const dataCaixaHoje = document.getElementById('dataCaixaHoje');
const badgeStatusCaixa = document.getElementById('badgeStatusCaixa');
const btnAbrirModalFecharCaixa = document.getElementById('btnAbrirModalFecharCaixa');
const btnReabrirCaixa = document.getElementById('btnReabrirCaixa');

const caixaTotalHoje = document.getElementById('caixaTotalHoje');
const caixaOrdensHoje = document.getElementById('caixaOrdensHoje');
const caixaFundoTroco = document.getElementById('caixaFundoTroco');

const caixaValorPix = document.getElementById('caixaValorPix');
const caixaValorDinheiro = document.getElementById('caixaValorDinheiro');
const caixaValorCredito = document.getElementById('caixaValorCredito');
const caixaValorDebito = document.getElementById('caixaValorDebito');
const caixaValorPrazo = document.getElementById('caixaValorPrazo');

const corpoRecebimentosHoje = document.getElementById('corpoRecebimentosHoje');
const corpoHistoricoCaixas = document.getElementById('corpoHistoricoCaixas');

// Modal de Fechamento
const modalFecharCaixa = document.getElementById('modalFecharCaixa');
const formConfirmarFechamentoCaixa = document.getElementById('formConfirmarFechamentoCaixa');
const modalFecharCaixaX = document.getElementById('modalFecharCaixaX');
const modalCancelarFechamentoBtn = document.getElementById('modalCancelarFechamentoBtn');
const modalDataHojeTexto = document.getElementById('modalDataHojeTexto');
const modalResumoAtendimentos = document.getElementById('modalResumoAtendimentos');
const modalResumoValor = document.getElementById('modalResumoValor');
const modalFundoTrocoInput = document.getElementById('modalFundoTrocoInput');
const modalObservacoesFechamento = document.getElementById('modalObservacoesFechamento');

function formatarDataBR(dataISO) {
	if (!dataISO) return '--/--/----';
	const partes = dataISO.split('-');
	if (partes.length === 3) {
		return `${partes[2]}/${partes[1]}/${partes[0]}`;
	}
	return dataISO;
}

function carregarDadosCaixa() {
	const statusHoje = CaixaService.getStatusHoje();
	const hoje = statusHoje.data;

	if (dataCaixaHoje) {
		dataCaixaHoje.textContent = formatarDataBR(hoje);
	}

	// Status e botões
	if (statusHoje.status === 'fechado') {
		if (badgeStatusCaixa) {
			badgeStatusCaixa.className = 'badge badge-caixa-fechado';
			badgeStatusCaixa.textContent = '🔒 Caixa Fechado';
		}
		if (btnAbrirModalFecharCaixa) btnAbrirModalFecharCaixa.style.display = 'none';
		if (btnReabrirCaixa) btnReabrirCaixa.style.display = 'inline-flex';
	} else {
		if (badgeStatusCaixa) {
			badgeStatusCaixa.className = 'badge badge-caixa-aberto';
			badgeStatusCaixa.textContent = '● Caixa Aberto';
		}
		if (btnAbrirModalFecharCaixa) btnAbrirModalFecharCaixa.style.display = 'inline-flex';
		if (btnReabrirCaixa) btnReabrirCaixa.style.display = 'none';
	}

	// Estatísticas de Hoje
	if (caixaTotalHoje) {
		caixaTotalHoje.textContent = `R$ ${statusHoje.totalValor.toFixed(2)}`;
	}
	if (caixaOrdensHoje) {
		caixaOrdensHoje.textContent = statusHoje.totalServicos;
	}
	if (caixaFundoTroco) {
		caixaFundoTroco.textContent = `R$ ${(statusHoje.fundoTroco || 0).toFixed(2)}`;
	}

	// Breakdown
	const b = statusHoje.breakdown;
	if (caixaValorPix) caixaValorPix.textContent = `R$ ${(b['Pix'] || 0).toFixed(2)}`;
	if (caixaValorDinheiro) caixaValorDinheiro.textContent = `R$ ${(b['Dinheiro'] || 0).toFixed(2)}`;
	if (caixaValorCredito) caixaValorCredito.textContent = `R$ ${(b['Cartão de Crédito'] || 0).toFixed(2)}`;
	if (caixaValorDebito) caixaValorDebito.textContent = `R$ ${(b['Cartão de Débito'] || 0).toFixed(2)}`;
	if (caixaValorPrazo) caixaValorPrazo.textContent = `R$ ${(b['A Prazo / Fiado'] || 0).toFixed(2)}`;

	// Renderizar lista de recebimentos de hoje
	renderizarRecebimentosHoje(hoje);

	// Renderizar histórico de fechamentos
	renderizarHistoricoFechamentos();
}

function renderizarRecebimentosHoje(dataHoje) {
	if (!corpoRecebimentosHoje) return;

	const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
	const hoje = dataHoje || obterDataHojeISO();

	const pedidosHoje = pedidos.filter((p) => {
		const dataRef = p.dataEncerramento || p.data;
		const estaEncerrado = !p.status || p.status === 'encerrado';
		return dataRef === hoje && estaEncerrado;
	});

	corpoRecebimentosHoje.innerHTML = '';

	if (pedidosHoje.length === 0) {
		corpoRecebimentosHoje.innerHTML = `
			<tr>
				<td colspan="6" class="empty-table-message">
					Nenhum recebimento registrado hoje até o momento. As ordens de serviço encerradas com pagamento aparecerão aqui automaticamente.
				</td>
			</tr>
		`;
		return;
	}

	[...pedidosHoje].reverse().forEach((p) => {
		const corObj = obterCorVeiculo(p.cor);
		const tr = document.createElement('tr');
		const valorFormatado = parseFloat(p.valor || 0).toFixed(2);
		const horario = p.horaEncerramento || p.horaEntrada || '--:--';
		const modeloTexto = p.modelo ? ` • ${p.modelo}` : '';

		tr.innerHTML = `
			<td><small style="font-weight:600; color:var(--text-muted);">${horario}</small></td>
			<td>
				<div class="veiculo-info-cell">
					${renderizarIconeCarro(corObj, 26)}
					<div class="veiculo-meta">
						<span class="badge-placa">${p.placa || 'SEM PLACA'}</span>
						<span class="veiculo-cor-nome">${corObj.nome}${modeloTexto}</span>
					</div>
				</div>
			</td>
			<td><strong>${p.cliente || 'Não informado'}</strong></td>
			<td>${p.servicos || '-'}</td>
			<td><span class="badge-price">R$ ${valorFormatado}</span></td>
			<td><span class="badge badge-payment">${p.formaPagamento || 'Outro'}</span></td>
		`;
		corpoRecebimentosHoje.appendChild(tr);
	});
}

function renderizarHistoricoFechamentos() {
	if (!corpoHistoricoCaixas) return;

	const fechamentos = CaixaService.getHistoricoFechamentos();
	corpoHistoricoCaixas.innerHTML = '';

	if (fechamentos.length === 0) {
		corpoHistoricoCaixas.innerHTML = `
			<tr>
				<td colspan="9" class="empty-table-message">
					Nenhum caixa anterior fechado no histórico ainda. Quando o caixa do dia for fechado (manualmente ou pela virada automática de dia), o resumo consolidado ficará arquivado aqui.
				</td>
			</tr>
		`;
		return;
	}

	fechamentos.forEach((f) => {
		const tr = document.createElement('tr');
		const totalArrecadado = parseFloat(f.totalValor || 0).toFixed(2);
		const pix = parseFloat((f.breakdown && f.breakdown['Pix']) || 0).toFixed(2);
		const dinheiro = parseFloat((f.breakdown && f.breakdown['Dinheiro']) || 0).toFixed(2);
		const cartoes = (
			parseFloat((f.breakdown && f.breakdown['Cartão de Crédito']) || 0) +
			parseFloat((f.breakdown && f.breakdown['Cartão de Débito']) || 0)
		).toFixed(2);

		const badgeTipo = f.automatico
			? '<span class="badge" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe;">🤖 Auto (Virada)</span>'
			: '<span class="badge" style="background:#f1f5f9; color:#334155; border:1px solid #cbd5e1;">🔒 Fechado</span>';

		const obs = f.observacoes || (f.motivoFechamento ? f.motivoFechamento : '-');

		tr.innerHTML = `
			<td><strong>${formatarDataBR(f.data)}</strong></td>
			<td>${badgeTipo}</td>
			<td>${f.horaFechamento || '--:--'}</td>
			<td><strong>${f.totalServicos || 0}</strong></td>
			<td><span class="badge-price" style="font-size:0.95rem;">R$ ${totalArrecadado}</span></td>
			<td>R$ ${pix}</td>
			<td>R$ ${dinheiro}</td>
			<td>R$ ${cartoes}</td>
			<td><small style="color:var(--text-muted);">${obs}</small></td>
		`;
		corpoHistoricoCaixas.appendChild(tr);
	});
}

// Controle do Modal de Fechamento de Caixa
function abrirModalFechamento() {
	const statusHoje = CaixaService.getStatusHoje();
	if (modalDataHojeTexto) modalDataHojeTexto.textContent = formatarDataBR(statusHoje.data);
	if (modalResumoAtendimentos) modalResumoAtendimentos.textContent = statusHoje.totalServicos;
	if (modalResumoValor) modalResumoValor.textContent = `R$ ${statusHoje.totalValor.toFixed(2)}`;
	if (modalFundoTrocoInput) modalFundoTrocoInput.value = (statusHoje.fundoTroco || 0).toFixed(2);
	if (modalObservacoesFechamento) modalObservacoesFechamento.value = '';

	modalFecharCaixa.classList.add('open');
}

function fecharModalFechamento() {
	modalFecharCaixa.classList.remove('open');
}

if (btnAbrirModalFecharCaixa) btnAbrirModalFecharCaixa.addEventListener('click', abrirModalFechamento);
if (modalFecharCaixaX) modalFecharCaixaX.addEventListener('click', fecharModalFechamento);
if (modalCancelarFechamentoBtn) modalCancelarFechamentoBtn.addEventListener('click', fecharModalFechamento);

if (formConfirmarFechamentoCaixa) {
	formConfirmarFechamentoCaixa.addEventListener('submit', (e) => {
		e.preventDefault();
		const fundoTroco = parseFloat(modalFundoTrocoInput.value) || 0;
		const obs = modalObservacoesFechamento.value.trim();

		CaixaService.fecharCaixaHoje(fundoTroco, obs);
		fecharModalFechamento();
		carregarDadosCaixa();
	});
}

if (btnReabrirCaixa) {
	btnReabrirCaixa.addEventListener('click', () => {
		if (confirm('Deseja reabrir o caixa de hoje para novos lançamentos e recebimentos?')) {
			CaixaService.reabrirCaixaHoje();
			carregarDadosCaixa();
		}
	});
}

document.addEventListener('DOMContentLoaded', () => {
	carregarDadosCaixa();
});
