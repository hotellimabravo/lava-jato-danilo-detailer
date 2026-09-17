// ==========================================================================
// Módulo de Integração com o Google Drive para Hospedagem do Database
// Escopo restrito e seguro: https://www.googleapis.com/auth/drive.file
// ==========================================================================

class GoogleDriveService {
	static NOME_ARQUIVO = 'database_sistema_gestao.xlsx';
	static SCOPES = ['https://www.googleapis.com/auth/drive.file'];
	
	static tokenClient = null;
	static cachedAccessToken = null;
	static configCache = null;

	// Carrega as credenciais geradas do firebase-applet-config.json
	static async obterConfig() {
		if (this.configCache) return this.configCache;
		try {
			const res = await fetch('/firebase-applet-config.json');
			if (res.ok) {
				this.configCache = await res.json();
				return this.configCache;
			}
		} catch (err) {
			console.warn('Não foi possível carregar firebase-applet-config.json diretamente:', err ? (err.message || String(err)) : '');
		}
		return null;
	}

	// Inicializa o cliente OAuth GSI
	static async inicializar() {
		const config = await this.obterConfig();
		if (!config || !config.oAuthClientId) {
			console.warn('OAuth Client ID não configurado.');
			return false;
		}

		if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
			console.warn('Google Identity Services (GSI) script não carregado ainda.');
			return false;
		}

		if (!this.tokenClient) {
			this.tokenClient = google.accounts.oauth2.initTokenClient({
				client_id: config.oAuthClientId,
				scope: this.SCOPES.join(' '),
				callback: (response) => {
					if (response && response.access_token) {
						this.cachedAccessToken = response.access_token;
						const expiraEm = (parseInt(response.expires_in, 10) || 3500) * 1000;
						const expiraTimestamp = Date.now() + expiraEm;
						
						// Salvar status de conexão local (apenas indicador, sem salvar o token sensível em storage)
						localStorage.setItem('gdrive_conectado', 'true');
						localStorage.setItem('gdrive_token_expira', String(expiraTimestamp));

						// Buscar dados do usuário conectado para exibir na interface
						this.obterPerfilUsuario(this.cachedAccessToken).then(user => {
							if (user) {
								localStorage.setItem('gdrive_usuario_email', user.email || '');
								localStorage.setItem('gdrive_usuario_nome', user.name || '');
								localStorage.setItem('gdrive_usuario_foto', user.picture || '');
							}
							window.dispatchEvent(new CustomEvent('gdrive-auth-changed', { 
								detail: { conectado: true, usuario: user } 
							}));
						});
					}
				},
				error_callback: (error) => {
					console.error('Erro na autenticação com Google Drive:', error);
					window.dispatchEvent(new CustomEvent('gdrive-auth-error', { detail: error }));
				}
			});
		}

		return true;
	}

	// Abre o popup do Google para login / permissão
	static conectar() {
		return new Promise((resolve, reject) => {
			if (!this.tokenClient) {
				this.inicializar().then(ok => {
					if (!ok) {
						reject(new Error('Não foi possível inicializar a autenticação do Google.'));
						return;
					}
					this.executarRequisicaoToken(resolve, reject);
				});
			} else {
				this.executarRequisicaoToken(resolve, reject);
			}
		});
	}

	static executarRequisicaoToken(resolve, reject) {
		try {
			// Callback único para o momento do clique
			const callbackOriginal = this.tokenClient.callback;
			this.tokenClient.callback = (response) => {
				callbackOriginal(response);
				if (response && response.access_token) {
					resolve(response.access_token);
				} else {
					reject(new Error(response?.error || 'Autorização cancelada ou recusada pelo usuário.'));
				}
			};
			// Inicia o fluxo oficial Google
			this.tokenClient.requestAccessToken({ prompt: '' });
		} catch (err) {
			reject(err);
		}
	}

	// Desconectar / Revogar
	static async desconectar() {
		if (this.cachedAccessToken && typeof google !== 'undefined' && google.accounts?.oauth2) {
			try {
				google.accounts.oauth2.revoke(this.cachedAccessToken, () => {
					console.log('Token do Google Drive revogado com sucesso.');
				});
			} catch (e) {
				console.warn('Falha ao revogar token:', e);
			}
		}
		this.cachedAccessToken = null;
		localStorage.removeItem('gdrive_conectado');
		localStorage.removeItem('gdrive_token_expira');
		localStorage.removeItem('gdrive_usuario_email');
		localStorage.removeItem('gdrive_usuario_nome');
		localStorage.removeItem('gdrive_usuario_foto');
		localStorage.removeItem('gdrive_file_id');
		localStorage.removeItem('gdrive_ultima_sync');

		window.dispatchEvent(new CustomEvent('gdrive-auth-changed', { 
			detail: { conectado: false, usuario: null } 
		}));
	}

	// Verifica se a conexão está marcada como ativa
	static estaConectado() {
		return localStorage.getItem('gdrive_conectado') === 'true';
	}

	// Obtém o token válido, solicitando refresh se expirou
	static async obterTokenValido() {
		if (this.cachedAccessToken) {
			return this.cachedAccessToken;
		}

		if (this.estaConectado()) {
			// Se o usuário já conectou anteriormente, pede silenciosamente sem prompt invasivo
			return await this.conectar();
		}

		return null;
	}

	// Busca informações básicas da conta conectada
	static async obterPerfilUsuario(token) {
		try {
			const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (res.ok) {
				return await res.json();
			}
		} catch (e) {
			console.warn('Erro ao obter dados do usuário Google:', e);
		}
		return null;
	}

	// ----------------------------------------------------------------------
	// Operações no Google Drive (Arquivo database_sistema_gestao.xlsx)
	// ----------------------------------------------------------------------

	// Procura se o arquivo do sistema já existe no Drive
	static async localizarArquivo(token) {
		const query = encodeURIComponent(
			`name = '${this.NOME_ARQUIVO}' and trashed = false`
		);
		const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size,webViewLink)&pageSize=1`;

		const res = await fetch(url, {
			headers: { Authorization: `Bearer ${token}` }
		});

		if (!res.ok) {
			const erro = await res.json();
			throw new Error(erro.error?.message || 'Erro ao consultar arquivos no Google Drive.');
		}

		const data = await res.json();
		if (data.files && data.files.length > 0) {
			const file = data.files[0];
			localStorage.setItem('gdrive_file_id', file.id);
			return file;
		}

		return null;
	}

	// Faz upload da base de dados atual para o Google Drive
	static async salvarNoDrive() {
		const token = await this.obterTokenValido();
		if (!token) {
			throw new Error('Você precisa conectar sua conta Google primeiro.');
		}

		if (typeof DatabaseExcelService === 'undefined') {
			throw new Error('DatabaseExcelService não está disponível.');
		}

		// Gera o binário do Excel atualizado
		const arrayBuffer = DatabaseExcelService.gerarArrayBufferCompleto();
		const blob = new Blob([arrayBuffer], { 
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
		});

		// Localiza ou verifica o ID salvo
		let fileId = localStorage.getItem('gdrive_file_id');
		if (!fileId) {
			const existente = await this.localizarArquivo(token);
			if (existente) {
				fileId = existente.id;
			}
		}

		let resultadoArquivo = null;

		if (fileId) {
			// Atualização de arquivo existente (PATCH / PUT no upload endpoint)
			const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
			const res = await fetch(url, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				},
				body: blob
			});

			if (!res.ok) {
				// Se deu erro 404 (arquivo foi apagado no Drive pelo usuário), tenta criar novo
				if (res.status === 404) {
					localStorage.removeItem('gdrive_file_id');
					return await this.salvarNoDrive();
				}
				const erro = await res.json();
				throw new Error(erro.error?.message || 'Erro ao atualizar o arquivo no Google Drive.');
			}
			resultadoArquivo = await res.json();
		} else {
			// Criação de novo arquivo (multipart/related)
			const metadata = {
				name: this.NOME_ARQUIVO,
				mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				description: 'Base de dados consolidada do Sistema de Gestão (Gerada automaticamente)'
			};

			const boundary = '-------314159265358979323846';
			const delimiter = `\r\n--${boundary}\r\n`;
			const closeDelim = `\r\n--${boundary}--`;

			const metaPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
			const fileHeader = `${delimiter}Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`;

			const blobMeta = new Blob([metaPart, fileHeader], { type: 'text/plain' });
			const blobFooter = new Blob([closeDelim], { type: 'text/plain' });
			const multipartBlob = new Blob([blobMeta, blob, blobFooter], { 
				type: `multipart/related; boundary=${boundary}` 
			});

			const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,webViewLink';
			const res = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`
				},
				body: multipartBlob
			});

			if (!res.ok) {
				const erro = await res.json();
				throw new Error(erro.error?.message || 'Erro ao criar arquivo no Google Drive.');
			}

			resultadoArquivo = await res.json();
			if (resultadoArquivo.id) {
				localStorage.setItem('gdrive_file_id', resultadoArquivo.id);
			}
		}

		// Atualiza registros de sincronização
		const agora = new Date().toISOString();
		localStorage.setItem('gdrive_ultima_sync', agora);

		// Dispara evento para a interface
		window.dispatchEvent(new CustomEvent('gdrive-synced', {
			detail: { data: agora, arquivoId: resultadoArquivo.id }
		}));

		return {
			sucesso: true,
			data: agora,
			fileId: resultadoArquivo.id
		};
	}

	// Baixa a base mais recente do Drive e restaura no sistema
	static async restaurarDoDrive(modo = 'substituir') {
		const token = await this.obterTokenValido();
		if (!token) {
			throw new Error('Você precisa conectar sua conta Google primeiro.');
		}

		let fileId = localStorage.getItem('gdrive_file_id');
		if (!fileId) {
			const existente = await this.localizarArquivo(token);
			if (existente) {
				fileId = existente.id;
			} else {
				throw new Error('Nenhum banco de dados (' + this.NOME_ARQUIVO + ') foi encontrado no seu Google Drive.');
			}
		}

		const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
		const res = await fetch(url, {
			headers: { Authorization: `Bearer ${token}` }
		});

		if (!res.ok) {
			const erro = await res.json().catch(() => ({}));
			throw new Error(erro.error?.message || 'Falha ao baixar o arquivo do Google Drive.');
		}

		const arrayBuffer = await res.arrayBuffer();

		// Processa o binário com o DatabaseExcelService
		const resultado = DatabaseExcelService.processarArrayBuffer(
			arrayBuffer, 
			'Google Drive (' + this.NOME_ARQUIVO + ')', 
			modo
		);

		const agora = new Date().toISOString();
		localStorage.setItem('gdrive_ultima_sync', agora);

		return resultado;
	}
}

window.GoogleDriveService = GoogleDriveService;
