// ==========================================================================
// Lógica da Página de Configurações, Negócio e Gerenciamento de Database Excel
// ==========================================================================

let arquivoExcelSelecionado = null;

document.addEventListener('DOMContentLoaded', () => {
	carregarFormularioNegocio();
	atualizarResumoEstatisticas();
	configurarDropzone();
	mascararCamposNegocio();
	inicializarGoogleDriveUI();

	// Habilita aba exclusiva do Master se for administrador
	const user = window.AuthService ? window.AuthService.getCurrentUser() : null;
	const tabMaster = document.getElementById('tabNavEmpresasMaster');
	if (tabMaster && user && user.isMaster) {
		tabMaster.style.display = 'flex';
	}

	if (window.location.hash === '#empresas') {
		alternarAbaConfig('empresas');
	}
});

// Alternância de Abas (Negócio, Database, Usuários, Equipe, Empresas SaaS)
function alternarAbaConfig(aba) {
	const tabNegocio = document.getElementById('tabNavNegocio');
	const tabDatabase = document.getElementById('tabNavDatabase');
	const tabUsuarios = document.getElementById('tabNavUsuarios');
	const tabEquipe = document.getElementById('tabNavEquipe');
	const tabEmpresas = document.getElementById('tabNavEmpresasMaster');

	const conteudoNegocio = document.getElementById('abaConteudoNegocio');
	const conteudoDatabase = document.getElementById('abaConteudoDatabase');
	const conteudoUsuarios = document.getElementById('abaConteudoUsuarios');
	const conteudoEquipe = document.getElementById('abaConteudoEquipe');
	const conteudoEmpresas = document.getElementById('abaConteudoEmpresas');

	// Desativa todas
	[tabNegocio, tabDatabase, tabUsuarios, tabEquipe, tabEmpresas].forEach(t => t && t.classList.remove('active'));
	[conteudoNegocio, conteudoDatabase, conteudoUsuarios, conteudoEquipe, conteudoEmpresas].forEach(c => c && (c.style.display = 'none'));

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
	} else if (aba === 'equipe') {
		if (tabEquipe) tabEquipe.classList.add('active');
		if (conteudoEquipe) conteudoEquipe.style.display = 'block';
		if (typeof filtrarComissoes === 'function') {
			filtrarComissoes();
		}
	} else if (aba === 'empresas') {
		if (tabEmpresas) tabEmpresas.classList.add('active');
		if (conteudoEmpresas) conteudoEmpresas.style.display = 'block';
		renderizarAbaEmpresasMaster();
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

	const tipoValor = elTipo ? elTipo.value : 'geral';
	const tipoCustomValor = elTipoCustom ? elTipoCustom.value : '';
	const nomeValor = (elNome && elNome.value.trim()) ? elNome.value.trim() : 'SEU NEGÓCIO';

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

// --------------------------------------------------------------------------
// LÓGICA DA INTEGRAÇÃO COM O GOOGLE DRIVE
// --------------------------------------------------------------------------

function inicializarGoogleDriveUI() {
	if (typeof GoogleDriveService === 'undefined') return;

	// Inicializa silenciosamente o cliente GSI
	GoogleDriveService.inicializar().catch(err => {
		console.warn('GSI inicialização:', err);
	});

	// Atualiza UI com base no status salvo
	atualizarStatusGoogleDriveUI();

	// Ouvir eventos customizados de autenticação
	window.addEventListener('gdrive-auth-changed', (e) => {
		atualizarStatusGoogleDriveUI();
	});

	window.addEventListener('gdrive-synced', (e) => {
		atualizarStatusGoogleDriveUI();
	});
}

function atualizarStatusGoogleDriveUI() {
	const conectado = typeof GoogleDriveService !== 'undefined' && GoogleDriveService.estaConectado();
	const estadoDesconectado = document.getElementById('gdriveEstadoDesconectado');
	const estadoConectado = document.getElementById('gdriveEstadoConectado');
	const elUserName = document.getElementById('gdriveUserName');
	const elUserEmail = document.getElementById('gdriveUserEmail');
	const elUserAvatar = document.getElementById('gdriveUserAvatar');
	const txtSync = document.getElementById('txtUltimaSyncDrive');

	if (estadoDesconectado && estadoConectado) {
		if (conectado) {
			estadoDesconectado.style.display = 'none';
			estadoConectado.style.display = 'inline-flex';

			const email = localStorage.getItem('gdrive_usuario_email') || 'Conta Google Conectada';
			const nome = localStorage.getItem('gdrive_usuario_nome') || 'Usuário';
			const foto = localStorage.getItem('gdrive_usuario_foto');

			if (elUserName) elUserName.textContent = nome;
			if (elUserEmail) elUserEmail.textContent = email;
			if (elUserAvatar) {
				if (foto) {
					elUserAvatar.innerHTML = `<img src="${foto}" alt="${nome}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
				} else {
					elUserAvatar.textContent = nome.charAt(0).toUpperCase();
				}
			}
		} else {
			estadoDesconectado.style.display = 'block';
			estadoConectado.style.display = 'none';
		}
	}

	if (txtSync) {
		const ultSync = localStorage.getItem('gdrive_ultima_sync');
		if (ultSync) {
			const data = new Date(ultSync);
			txtSync.textContent = `Última sincronização com Drive: ${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR')}`;
		} else {
			txtSync.textContent = 'Última sincronização com Drive: Nenhuma realizada ainda';
		}
	}
}

async function conectarGoogleDriveUI() {
	const btn = document.getElementById('btnConectarGoogle');
	if (btn) {
		btn.style.opacity = '0.7';
		btn.style.pointerEvents = 'none';
	}

	try {
		await GoogleDriveService.conectar();
		exibirMensagemDrive('sucesso', 'Conta Google Conectada!', 'Agora você pode salvar ou restaurar seu banco de dados diretamente no Google Drive.');
		atualizarStatusGoogleDriveUI();
	} catch (err) {
		console.error('Falha ao conectar Google:', err);
		exibirMensagemDrive('erro', 'Falha na conexão com Google', err.message || 'O fluxo de login foi cancelado ou fechado.');
	} finally {
		if (btn) {
			btn.style.opacity = '1';
			btn.style.pointerEvents = 'auto';
		}
	}
}

async function desconectarGoogleDriveUI() {
	if (!confirm('Deseja desconectar sua conta Google? O sistema deixará de sincronizar com a nuvem do seu Drive.')) {
		return;
	}

	try {
		await GoogleDriveService.desconectar();
		exibirMensagemDrive('aviso', 'Conta Google Desconectada', 'A sincronização com o Google Drive foi desativada. Seus dados locais permanecem intactos.');
		atualizarStatusGoogleDriveUI();
	} catch (err) {
		console.error('Erro ao desconectar:', err);
	}
}

async function executarSalvarNoDrive() {
	if (!GoogleDriveService.estaConectado()) {
		if (confirm('Sua conta Google ainda não está conectada. Deseja conectar agora para salvar no Google Drive?')) {
			try {
				await GoogleDriveService.conectar();
			} catch (e) {
				return;
			}
		} else {
			return;
		}
	}

	const btn = document.getElementById('btnSalvarNoDrive');
	if (btn) {
		btn.disabled = true;
		btn.textContent = '⏳ Salvando no Google Drive...';
	}

	try {
		const res = await GoogleDriveService.salvarNoDrive();
		exibirMensagemDrive(
			'sucesso', 
			'Base de Dados Salva no Google Drive!', 
			`O arquivo "database_sistema_gestao.xlsx" foi sincronizado com sucesso na sua conta em ${new Date().toLocaleTimeString('pt-BR')}.`
		);
		atualizarStatusGoogleDriveUI();
		atualizarResumoEstatisticas();
	} catch (err) {
		console.error('Erro ao salvar no Drive:', err);
		exibirMensagemDrive('erro', 'Erro ao salvar no Google Drive', err.message || 'Verifique sua conexão e tente novamente.');
	} finally {
		if (btn) {
			btn.disabled = false;
			btn.textContent = '☁️ Salvar no Drive Agora';
		}
	}
}

async function executarRestaurarDoDrive() {
	if (!GoogleDriveService.estaConectado()) {
		if (confirm('Sua conta Google ainda não está conectada. Deseja conectar agora para baixar os dados do seu Google Drive?')) {
			try {
				await GoogleDriveService.conectar();
			} catch (e) {
				return;
			}
		} else {
			return;
		}
	}

	if (!confirm('Atenção: Ao restaurar do Google Drive, os dados do sistema serão sincronizados com a versão salva na sua nuvem. Deseja continuar?')) {
		return;
	}

	const btn = document.getElementById('btnRestaurarDoDrive');
	if (btn) {
		btn.disabled = true;
		btn.textContent = '⏳ Baixando do Drive...';
	}

	try {
		const res = await GoogleDriveService.restaurarDoDrive('substituir');
		exibirMensagemDrive(
			'sucesso', 
			'Base Restaurada com Sucesso do Google Drive!', 
			`Foram sincronizados: ${res.clientesLidos} clientes, ${res.servicosLidos} serviços, ${res.pedidosLidos} O.S. e ${res.caixasLidos} caixas.`
		);
		atualizarStatusGoogleDriveUI();
		atualizarResumoEstatisticas();
		if (typeof BrandService !== 'undefined') {
			BrandService.aplicarEmTudo();
		}
	} catch (err) {
		console.error('Erro ao restaurar do Drive:', err);
		exibirMensagemDrive('erro', 'Erro ao restaurar do Google Drive', err.message || 'Certifique-se de que já salvou ao menos uma vez o arquivo no Drive.');
	} finally {
		if (btn) {
			btn.disabled = false;
			btn.textContent = '📥 Baixar & Restaurar';
		}
	}
}

function exibirMensagemDrive(tipo, titulo, texto) {
	const box = document.getElementById('msgStatusDrive');
	const icon = document.getElementById('msgStatusDriveIcon');
	const tit = document.getElementById('msgStatusDriveTitulo');
	const txt = document.getElementById('msgStatusDriveTexto');

	if (!box) return;

	box.style.display = 'flex';

	if (tipo === 'sucesso') {
		box.style.background = '#f0fdf4';
		box.style.borderColor = '#bbf7d0';
		box.style.color = '#166534';
		if (icon) icon.textContent = '✅';
		if (txt) txt.style.color = '#15803d';
	} else if (tipo === 'erro') {
		box.style.background = '#fef2f2';
		box.style.borderColor = '#fecaca';
		box.style.color = '#991b1b';
		if (icon) icon.textContent = '⚠️';
		if (txt) txt.style.color = '#b91c1c';
	} else {
		box.style.background = '#eff6ff';
		box.style.borderColor = '#bfdbfe';
		box.style.color = '#1e40af';
		if (icon) icon.textContent = 'ℹ️';
		if (txt) txt.style.color = '#1d4ed8';
	}

	if (tit) tit.textContent = titulo;
	if (txt) txt.textContent = texto;
}

// ==========================================================================
// ABA GESTÃO DE EMPRESAS (EXCLUSIVO MASTER)
// ==========================================================================

function renderizarAbaEmpresasMaster() {
	if (!window.EmpresaService) return;

	const empresas = window.EmpresaService.getEmpresas();
	const ativa = window.EmpresaService.getEmpresaAtiva();

	// Atualiza os cards de métricas
	const statTotal = document.getElementById('statTotalEmpresas');
	if (statTotal) statTotal.textContent = empresas.length;

	const statAtiva = document.getElementById('statEmpresaAtivaNome');
	if (statAtiva) statAtiva.textContent = `${ativa.icone || '🏢'} ${ativa.nome}`;

	// Renderiza a lista de empresas
	const grid = document.getElementById('gridEmpresasCadastradas');
	if (!grid) return;

	grid.innerHTML = '';

	empresas.forEach(emp => {
		const isAtiva = emp.id === ativa.id;
		const card = document.createElement('div');
		card.className = `tenant-card ${isAtiva ? 'active-tenant' : ''}`;

		const badgeNicho = `<span class="badge" style="background: #f1f5f9; color: #334155; font-size: 0.75rem; text-transform: uppercase;">${emp.tipoNegocio}</span>`;
		
		const statusBtn = isAtiva
			? `<span class="badge" style="background: #fef3c7; color: #b45309; border: 1px solid #fde68a; font-weight: 700; padding: 5px 10px;">⭐ Empresa em Visualização</span>`
			: `<button type="button" class="btn btn-sm btn-primary" onclick="alternarEmpresaDireto('${emp.id}')">⚡ Alternar Painel</button>`;

		const deleteBtn = emp.id === 'empresa_danilo' 
			? '' 
			: `<button type="button" class="btn btn-sm" style="background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 4px 8px;" title="Excluir Estabelecimento" onclick="excluirEmpresaMaster('${emp.id}')">🗑️</button>`;

		card.innerHTML = `
			<div class="tenant-card-header">
				<div class="tenant-card-avatar">${emp.icone || '🏢'}</div>
				<div class="tenant-card-meta">
					<div class="tenant-card-title">${emp.nome}</div>
					<div class="tenant-card-sub">${badgeNicho} <span style="color: #94a3b8; font-size: 0.72rem;">(${emp.id})</span></div>
				</div>
			</div>

			<div style="font-size: 0.8rem; color: var(--text-muted); background: var(--bg-surface); padding: 8px 10px; border-radius: 4px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 4px;">
				<div><strong>Responsável:</strong> ${emp.adminNome || 'Administrador'}</div>
				<div><strong>Usuário de Login:</strong> <code style="background: #e2e8f0; padding: 1px 4px; border-radius: 3px;">${emp.adminUsername}</code></div>
				${emp.telefone ? `<div><strong>Contato:</strong> ${emp.telefone}</div>` : ''}
			</div>

			<div class="tenant-card-footer">
				<div style="display: flex; gap: 6px; align-items: center;">
					${statusBtn}
				</div>
				<div>
					${deleteBtn}
				</div>
			</div>
		`;

		grid.appendChild(card);
	});
}

function abrirModalNovaEmpresa() {
	const modal = document.getElementById('modalNovaEmpresa');
	if (modal) {
		modal.style.display = 'flex';
		const form = document.getElementById('formNovaEmpresa');
		if (form) form.reset();
		selecionarSegmentoNovo('lava_jato');
		const input = document.getElementById('novoNomeEmpresa');
		if (input) input.focus();
	}
}

function fecharModalNovaEmpresa() {
	const modal = document.getElementById('modalNovaEmpresa');
	if (modal) modal.style.display = 'none';
}

function selecionarSegmentoNovo(tipo) {
	const input = document.getElementById('novoTipoNegocio');
	if (input) input.value = tipo;

	const cards = document.querySelectorAll('[data-segment-novo]');
	cards.forEach(c => {
		if (c.getAttribute('data-segment-novo') === tipo) {
			c.classList.add('active');
		} else {
			c.classList.remove('active');
		}
	});
}

async function salvarNovaEmpresaMaster(e) {
	e.preventDefault();
	if (!window.EmpresaService) return;

	const btn = document.getElementById('btnSalvarEmpresaSubmit');
	const nome = document.getElementById('novoNomeEmpresa').value.trim();
	const tipoNegocio = document.getElementById('novoTipoNegocio').value;
	const adminNome = document.getElementById('novoAdminNome').value.trim();
	const adminUsername = document.getElementById('novoAdminUsername').value.trim();
	const adminPassword = document.getElementById('novoAdminPassword').value;
	const telefone = document.getElementById('novoAdminTelefone').value.trim();

	try {
		if (btn) {
			btn.disabled = true;
			btn.textContent = '⏳ Criando base na nuvem...';
		}

		const nova = await window.EmpresaService.criarEmpresa({
			nome,
			tipoNegocio,
			adminNome,
			adminUsername,
			adminPassword,
			telefone
		});

		fecharModalNovaEmpresa();
		renderizarAbaEmpresasMaster();
		if (window.EmpresaService.renderMasterTenantBar) {
			window.EmpresaService.renderMasterTenantBar();
		}

		const querAlternar = confirm(`Estabelecimento "${nova.nome}" cadastrado com sucesso na nuvem!\n\nDeseja alternar agora mesmo o painel para testar esta nova empresa?`);
		if (querAlternar) {
			window.EmpresaService.trocarEmpresaMaster(nova.id);
		}
	} catch (err) {
		alert('Erro ao criar empresa: ' + (err.message || err));
	} finally {
		if (btn) {
			btn.disabled = false;
			btn.textContent = 'Criar Empresa e Habilitar Acesso';
		}
	}
}

function alternarEmpresaDireto(id) {
	if (window.EmpresaService) {
		window.EmpresaService.trocarEmpresaMaster(id);
	}
}

async function excluirEmpresaMaster(id) {
	if (!window.EmpresaService) return;
	if (confirm('Tem certeza que deseja excluir este estabelecimento do sistema?')) {
		try {
			await window.EmpresaService.excluirEmpresa(id);
			renderizarAbaEmpresasMaster();
			if (window.EmpresaService.renderMasterTenantBar) {
				window.EmpresaService.renderMasterTenantBar();
			}
		} catch (err) {
			alert(err.message || err);
		}
	}
}

window.renderizarAbaEmpresasMaster = renderizarAbaEmpresasMaster;
window.abrirModalNovaEmpresa = abrirModalNovaEmpresa;
window.fecharModalNovaEmpresa = fecharModalNovaEmpresa;
window.selecionarSegmentoNovo = selecionarSegmentoNovo;
window.salvarNovaEmpresaMaster = salvarNovaEmpresaMaster;
window.alternarEmpresaDireto = alternarEmpresaDireto;
window.excluirEmpresaMaster = excluirEmpresaMaster;

