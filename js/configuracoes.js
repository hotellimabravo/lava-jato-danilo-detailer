// ==========================================================================
// Lógica da Página de Configurações e Gerenciamento de Database Excel
// ==========================================================================

let arquivoExcelSelecionado = null;

document.addEventListener('DOMContentLoaded', () => {
	atualizarResumoEstatisticas();
	configurarDropzone();
});

// Alternância de Abas
function alternarAbaConfig(aba) {
	const tabDatabase = document.getElementById('tabNavDatabase');
	const tabUsuarios = document.getElementById('tabNavUsuarios');
	const conteudoDatabase = document.getElementById('abaConteudoDatabase');
	const conteudoUsuarios = document.getElementById('abaConteudoUsuarios');

	if (aba === 'database') {
		tabDatabase.classList.add('active');
		tabUsuarios.classList.remove('active');
		conteudoDatabase.style.display = 'block';
		conteudoUsuarios.style.display = 'none';
		atualizarResumoEstatisticas();
	} else if (aba === 'usuarios') {
		tabUsuarios.classList.add('active');
		tabDatabase.classList.remove('active');
		conteudoDatabase.style.display = 'none';
		conteudoUsuarios.style.display = 'block';
	}
}

// Atualizar diagnóstico da base em tela
function atualizarResumoEstatisticas() {
	const stats = DatabaseExcelService.getEstatisticasAtuais();

	const elClientes = document.getElementById('dbTotalClientes');
	const elServicos = document.getElementById('dbTotalServicos');
	const elPedidos = document.getElementById('dbTotalPedidos');
	const elCaixas = document.getElementById('dbTotalCaixas');
	const elOrigem = document.getElementById('infoUltimaOrigem');
	const elBadgeOrigem = document.getElementById('badgeOrigemBase');

	if (elClientes) elClientes.textContent = stats.totalClientes;
	if (elServicos) elServicos.textContent = stats.totalServicos;
	if (elPedidos) elPedidos.textContent = stats.totalPedidos;
	if (elCaixas) elCaixas.textContent = stats.totalCaixas;

	if (elOrigem) {
		if (stats.infoDb && stats.infoDb.nomeArquivo) {
			const dataFormatada = new Date(stats.infoDb.dataImportacao).toLocaleString('pt-BR');
			elOrigem.innerHTML = `
				📁 <strong>Planilha de Origem Ativa:</strong> ${stats.infoDb.nomeArquivo} &bull; 
				Importada em: <strong>${dataFormatada}</strong> &bull; 
				Tamanho: <strong>${Math.round(stats.infoDb.tamanhoBytes / 1024)} KB</strong>
			`;
			if (elBadgeOrigem) {
				elBadgeOrigem.textContent = 'Planilha Vinculada: ' + stats.infoDb.nomeArquivo;
				elBadgeOrigem.className = 'badge badge-primary';
			}
		} else {
			elOrigem.innerHTML = `
				💾 <strong>Base Operante:</strong> Armazenamento local seguro. Nenhuma planilha externa foi importada recentemente.
			`;
			if (elBadgeOrigem) {
				elBadgeOrigem.textContent = 'Base Local Ativa';
				elBadgeOrigem.className = 'badge badge-success';
			}
		}
	}

	// Atualizar texto de último backup exportado
	const txtBackup = document.getElementById('txtUltimoBackup');
	if (txtBackup && stats.infoDb && stats.infoDb.ultimoBackupExportado) {
		const dataBackup = new Date(stats.infoDb.ultimoBackupExportado).toLocaleString('pt-BR');
		txtBackup.innerHTML = `Último backup baixado: <strong>${dataBackup}</strong> (${stats.infoDb.ultimoArquivoExportado || 'xlsx'})`;
	}
}

// Configuração do Drag and Drop
function configurarDropzone() {
	const dropzone = document.getElementById('dropzoneExcel');
	if (!dropzone) return;

	['dragenter', 'dragover'].forEach(eventName => {
		dropzone.addEventListener(eventName, (e) => {
			e.preventDefault();
			e.stopPropagation();
			dropzone.classList.add('dragover');
		}, false);
	});

	['dragleave', 'drop'].forEach(eventName => {
		dropzone.addEventListener(eventName, (e) => {
			e.preventDefault();
			e.stopPropagation();
			dropzone.classList.remove('dragover');
		}, false);
	});

	dropzone.addEventListener('drop', (e) => {
		const dt = e.dataTransfer;
		const files = dt.files;
		if (files && files.length > 0) {
			processarArquivo(files[0]);
		}
	});
}

function tratarArquivoSelecionado(event) {
	const file = event.target.files[0];
	if (file) {
		processarArquivo(file);
	}
}

function processarArquivo(file) {
	if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
		alert('Por favor, selecione um arquivo de planilha no formato Excel (.xlsx ou .xls).');
		return;
	}

	arquivoExcelSelecionado = file;
	const dropzone = document.getElementById('dropzoneExcel');
	const btnConfirmar = document.getElementById('btnConfirmarImportacao');

	if (dropzone) {
		dropzone.innerHTML = `
			<span class="excel-dropzone-icon">📄</span>
			<span class="excel-dropzone-title" style="color: var(--primary);">${file.name}</span>
			<span class="excel-dropzone-desc">Arquivo pronto para ser carregado. Tamanho: ${(file.size / 1024).toFixed(1)} KB. Clique novamente se desejar trocar de arquivo.</span>
			<input type="file" id="inputArquivoExcel" accept=".xlsx, .xls" style="display: none;" onchange="tratarArquivoSelecionado(event)" />
		`;
	}

	if (btnConfirmar) {
		btnConfirmar.disabled = false;
		btnConfirmar.focus();
	}
}

async function executarImportacao() {
	if (!arquivoExcelSelecionado) {
		alert('Selecione primeiro uma planilha Excel para carregar.');
		return;
	}

	const modoRadios = document.getElementsByName('modoImportacao');
	let modoEscolhido = 'substituir';
	for (const r of modoRadios) {
		if (r.checked) {
			modoEscolhido = r.value;
			break;
		}
	}

	const btnConfirmar = document.getElementById('btnConfirmarImportacao');
	const resultadoDiv = document.getElementById('resultadoImportacao');

	if (btnConfirmar) {
		btnConfirmar.disabled = true;
		btnConfirmar.textContent = '⏳ Lendo e carregando planilha...';
	}

	try {
		const res = await DatabaseExcelService.importarArquivoExcel(arquivoExcelSelecionado, modoEscolhido);

		if (resultadoDiv) {
			resultadoDiv.style.display = 'block';
			resultadoDiv.className = 'db-status-banner';
			resultadoDiv.style.background = '#eff6ff';
			resultadoDiv.style.borderColor = '#bfdbfe';
			resultadoDiv.style.color = '#1e40af';
			resultadoDiv.innerHTML = `
				<span class="db-status-icon">✅</span>
				<div class="db-status-text">
					<strong>Planilha Carregada com Sucesso como Base Ativa!</strong>
					<p style="color: #1d4ed8;">
						Foram importados: <strong>${res.clientesLidos}</strong> clientes, 
						<strong>${res.servicosLidos}</strong> serviços, 
						<strong>${res.pedidosLidos}</strong> ordens de serviço e 
						<strong>${res.caixasLidos}</strong> registros do livro caixa.
					</p>
				</div>
			`;
		}

		atualizarResumoEstatisticas();

		if (btnConfirmar) {
			btnConfirmar.textContent = '✅ Planilha Aplicada!';
			setTimeout(() => {
				btnConfirmar.disabled = false;
				btnConfirmar.textContent = '🚀 Carregar Planilha Selecionada';
			}, 3000);
		}
	} catch (err) {
		console.error('Erro na importação:', err);
		if (resultadoDiv) {
			resultadoDiv.style.display = 'block';
			resultadoDiv.className = 'db-status-banner';
			resultadoDiv.style.background = '#fef2f2';
			resultadoDiv.style.borderColor = '#fecaca';
			resultadoDiv.style.color = '#991b1b';
			resultadoDiv.innerHTML = `
				<span class="db-status-icon">⚠️</span>
				<div class="db-status-text">
					<strong>Erro ao carregar planilha</strong>
					<p style="color: #b91c1c;">${err.message || 'Verifique se o arquivo é um Excel válido e possui as abas corretas.'}</p>
				</div>
			`;
		}
		if (btnConfirmar) {
			btnConfirmar.disabled = false;
			btnConfirmar.textContent = 'Tentar Novamente';
		}
	}
}

function executarExportacao() {
	try {
		const btn = document.getElementById('btnExportarBase');
		if (btn) btn.innerHTML = '⏳ Gerando Planilha...';

		const nomeArquivo = DatabaseExcelService.exportarBaseCompleta();

		setTimeout(() => {
			if (btn) btn.innerHTML = '<span>📥 Baixar Planilha Completa Atual (.xlsx)</span>';
			atualizarResumoEstatisticas();
		}, 800);
	} catch (err) {
		alert('Falha ao exportar base: ' + err.message);
	}
}
