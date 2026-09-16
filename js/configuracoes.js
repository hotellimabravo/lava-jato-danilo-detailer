// ==========================================================================
// Lógica da Página de Configurações, Negócio e Gerenciamento de Database Excel
// ==========================================================================

let arquivoExcelSelecionado = null;

document.addEventListener('DOMContentLoaded', () => {
	carregarFormularioNegocio();
	atualizarResumoEstatisticas();
	configurarDropzone();
	mascararCamposNegocio();
});

// Alternância de Abas (Negócio, Database, Usuários)
function alternarAbaConfig(aba) {
	const tabNegocio = document.getElementById('tabNavNegocio');
	const tabDatabase = document.getElementById('tabNavDatabase');
	const tabUsuarios = document.getElementById('tabNavUsuarios');

	const conteudoNegocio = document.getElementById('abaConteudoNegocio');
	const conteudoDatabase = document.getElementById('abaConteudoDatabase');
	const conteudoUsuarios = document.getElementById('abaConteudoUsuarios');

	// Desativa todas
	[tabNegocio, tabDatabase, tabUsuarios].forEach(t => t && t.classList.remove('active'));
	[conteudoNegocio, conteudoDatabase, conteudoUsuarios].forEach(c => c && (c.style.display = 'none'));

	if (aba === 'negocio') {
		if (tabNegocio) tabNegocio.classList.add('active');
		if (conteudoNegocio) conteudoNegocio.style.display = 'block';
		carregarFormularioNegocio();
	} else if (aba === 'database') {
		if (tabDatabase) tabDatabase.classList.add('active');
		if (conteudoDatabase) conteudoDatabase.style.display = 'block';
		atualizarResumoEstatisticas();
	} else if (aba === 'usuarios') {
		if (tabUsuarios) tabUsuarios.classList.add('active');
		if (conteudoUsuarios) conteudoUsuarios.style.display = 'block';
	}
}

// --------------------------------------------------------------------------
// LÓGICA DA ABA NEGÓCIO
// --------------------------------------------------------------------------

function mascararCamposNegocio() {
	const inputCnpj = document.getElementById('cfgCnpj');
	if (inputCnpj) {
		inputCnpj.addEventListener('input', (e) => {
			let v = e.target.value.replace(/\D/g, '');
			if (v.length > 14) v = v.substring(0, 14);
			if (v.length > 12) {
				e.target.value = `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5, 8)}/${v.substring(8, 12)}-${v.substring(12)}`;
			} else if (v.length > 8) {
				e.target.value = `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5, 8)}/${v.substring(8)}`;
			} else if (v.length > 5) {
				e.target.value = `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5)}`;
			} else if (v.length > 2) {
				e.target.value = `${v.substring(0, 2)}.${v.substring(2)}`;
			} else {
				e.target.value = v;
			}
		});
	}

	const inputTel = document.getElementById('cfgTelefone');
	if (inputTel) {
		inputTel.addEventListener('input', (e) => {
			let v = e.target.value.replace(/\D/g, '');
			if (v.length > 11) v = v.substring(0, 11);
			if (v.length > 10) {
				e.target.value = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
			} else if (v.length > 6) {
				e.target.value = `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
			} else if (v.length > 2) {
				e.target.value = `(${v.substring(0, 2)}) ${v.substring(2)}`;
			} else if (v.length > 0) {
				e.target.value = `(${v}`;
			} else {
				e.target.value = '';
			}
		});
	}

	const inputNome = document.getElementById('cfgNomeEstabelecimento');
	if (inputNome) {
		inputNome.addEventListener('input', () => atualizarPreviewCabecalho());
	}

	const inputCustom = document.getElementById('cfgTipoCustom');
	if (inputCustom) {
		inputCustom.addEventListener('input', () => atualizarPreviewCabecalho());
	}
}

function carregarFormularioNegocio() {
	if (typeof BrandService === 'undefined') return;

	const config = BrandService.getConfig();

	const elNome = document.getElementById('cfgNomeEstabelecimento');
	const elRazao = document.getElementById('cfgRazaoSocial');
	const elCnpj = document.getElementById('cfgCnpj');
	const elTipo = document.getElementById('cfgTipoNegocio');
	const elTipoCustom = document.getElementById('cfgTipoCustom');
	const elRowCustom = document.getElementById('rowTipoCustom');
	const elTel = document.getElementById('cfgTelefone');
	const elResp = document.getElementById('cfgResponsavel');
	const elEnd = document.getElementById('cfgEndereco');

	const tipoAtual = config.tipoNegocio || 'lava_jato';

	if (elNome) elNome.value = config.nomeEstabelecimento || '';
	if (elRazao) elRazao.value = config.razaoSocial || '';
	if (elCnpj) elCnpj.value = config.cnpj || '';
	if (elTipo) elTipo.value = tipoAtual;
	if (elTipoCustom) elTipoCustom.value = config.tipoNegocioCustom || '';
	if (elTel) elTel.value = config.telefone || '';
	if (elResp) elResp.value = config.responsavel || '';
	if (elEnd) elEnd.value = config.endereco || '';

	if (elRowCustom) {
		elRowCustom.style.display = (tipoAtual === 'geral') ? 'flex' : 'none';
	}

	// Atualizar cartões visuais de segmento
	atualizarCardsSegmentoUI(tipoAtual);
	atualizarPreviewCabecalho();
}

function selecionarSegmentoCard(segmentoKey) {
	const elTipo = document.getElementById('cfgTipoNegocio');
	if (elTipo) {
		elTipo.value = segmentoKey;
	}
	atualizarCardsSegmentoUI(segmentoKey);
	aoMudarTipoNegocio();

	// Se for segmento geral/personalizado, foca no input
	if (segmentoKey === 'geral') {
		const inputCustom = document.getElementById('cfgTipoCustom');
		if (inputCustom) {
			setTimeout(() => inputCustom.focus(), 100);
		}
	}
}

function atualizarCardsSegmentoUI(segmentoAtivo) {
	const cards = document.querySelectorAll('.segment-option-card');
	cards.forEach(card => {
		const seg = card.getAttribute('data-segment');
		if (seg === segmentoAtivo) {
			card.classList.add('active');
		} else {
			card.classList.remove('active');
		}
	});
}

function aoMudarTipoNegocio() {
	const elTipo = document.getElementById('cfgTipoNegocio');
	const elRowCustom = document.getElementById('rowTipoCustom');
	const valor = elTipo ? elTipo.value : 'lava_jato';
	
	if (elRowCustom) {
		elRowCustom.style.display = (valor === 'geral') ? 'flex' : 'none';
	}
	atualizarCardsSegmentoUI(valor);
	atualizarPreviewCabecalho();
}

function atualizarPreviewCabecalho() {
	if (typeof BrandService === 'undefined') return;

	const elNome = document.getElementById('cfgNomeEstabelecimento');
	const elTipo = document.getElementById('cfgTipoNegocio');
	const elTipoCustom = document.getElementById('cfgTipoCustom');

	const tipoValor = elTipo ? elTipo.value : 'lava_jato';
	const tipoCustomValor = elTipoCustom ? elTipoCustom.value : '';
	const nomeValor = (elNome && elNome.value.trim()) ? elNome.value.trim() : 'Danilo Detailer';

	const dadosTemp = {
		tipoNegocio: tipoValor,
		tipoNegocioCustom: tipoCustomValor,
		nomeEstabelecimento: nomeValor
	};

	const visual = BrandService.getInfoVisual(dadosTemp);

	const previewLogo = document.getElementById('previewLogo');
	const previewTitulo = document.getElementById('previewTitulo');
	const previewSubtitulo = document.getElementById('previewSubtitulo');
	const badgeSegmento = document.getElementById('badgePreviewSegmento');

	if (previewLogo) previewLogo.textContent = visual.icone;
	if (previewTitulo) previewTitulo.textContent = visual.titulo;
	if (previewSubtitulo) previewSubtitulo.textContent = visual.subtitulo;

	if (badgeSegmento) {
		badgeSegmento.textContent = `${visual.icone} ${visual.titulo}`;
	}
}

function salvarConfiguracaoNegocio(e) {
	if (e) e.preventDefault();

	const elNome = document.getElementById('cfgNomeEstabelecimento');
	const elRazao = document.getElementById('cfgRazaoSocial');
	const elCnpj = document.getElementById('cfgCnpj');
	const elTipo = document.getElementById('cfgTipoNegocio');
	const elTipoCustom = document.getElementById('cfgTipoCustom');
	const elTel = document.getElementById('cfgTelefone');
	const elResp = document.getElementById('cfgResponsavel');
	const elEnd = document.getElementById('cfgEndereco');

	const nomeEstabelecimento = elNome ? elNome.value.trim() : '';
	if (!nomeEstabelecimento) {
		alert('Por favor, preencha o Nome do Estabelecimento.');
		if (elNome) elNome.focus();
		return;
	}

	const novosDados = {
		nomeEstabelecimento: nomeEstabelecimento,
		razaoSocial: elRazao ? elRazao.value.trim() : '',
		cnpj: elCnpj ? elCnpj.value.trim() : '',
		tipoNegocio: elTipo ? elTipo.value : 'lava_jato',
		tipoNegocioCustom: elTipoCustom ? elTipoCustom.value.trim() : '',
		telefone: elTel ? elTel.value.trim() : '',
		responsavel: elResp ? elResp.value.trim() : '',
		endereco: elEnd ? elEnd.value.trim() : ''
	};

	if (typeof BrandService !== 'undefined') {
		BrandService.salvarConfig(novosDados);
	}

	const msgSucesso = document.getElementById('msgSucessoNegocio');
	if (msgSucesso) {
		msgSucesso.style.display = 'flex';
		msgSucesso.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		setTimeout(() => {
			msgSucesso.style.display = 'none';
		}, 5000);
	}

	atualizarPreviewCabecalho();
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
