// ==========================================================================
// GoogleCalendarService: Integração com Google Calendar API (v3) & GSI
// ==========================================================================

class GoogleCalendarService {
	static CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
	static tokenClient = null;
	static cachedAccessToken = null;
	static configCache = null;

	static async obterConfig() {
		if (this.configCache) return this.configCache;
		try {
			const res = await fetch('/firebase-applet-config.json');
			if (res.ok) {
				this.configCache = await res.json();
				return this.configCache;
			}
		} catch (err) {
			console.warn('Erro ao carregar firebase-applet-config.json:', err ? (err.message || String(err)) : '');
		}
		return null;
	}

	static async inicializar() {
		const config = await this.obterConfig();
		if (!config || !config.oAuthClientId) {
			console.warn('OAuth Client ID não configurado para Calendar.');
			return false;
		}

		if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
			console.warn('Google Identity Services (GSI) script não carregado.');
			return false;
		}

		if (!this.tokenClient) {
			this.tokenClient = google.accounts.oauth2.initTokenClient({
				client_id: config.oAuthClientId,
				scope: `${this.CALENDAR_SCOPE} https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email`,
				callback: (response) => {
					if (response && response.access_token) {
						this.cachedAccessToken = response.access_token;
						const expiraEm = (parseInt(response.expires_in, 10) || 3500) * 1000;
						localStorage.setItem('gcalendar_conectado', 'true');
						localStorage.setItem('gcalendar_token_expira', String(Date.now() + expiraEm));
						
						// Se houver callback pendente
						if (window._onGoogleCalendarAuthSuccess) {
							window._onGoogleCalendarAuthSuccess(this.cachedAccessToken);
							window._onGoogleCalendarAuthSuccess = null;
						}
					}
				}
			});
		}
		return true;
	}

	static estaConectado() {
		const expira = parseInt(localStorage.getItem('gcalendar_token_expira') || '0', 10);
		return localStorage.getItem('gcalendar_conectado') === 'true' && (Date.now() < expira || !!this.cachedAccessToken);
	}

	static desconectar() {
		this.cachedAccessToken = null;
		localStorage.removeItem('gcalendar_conectado');
		localStorage.removeItem('gcalendar_token_expira');
	}

	static async conectar() {
		const initOk = await this.inicializar();
		if (!initOk || !this.tokenClient) {
			throw new Error('Google Identity Services não disponível no momento.');
		}

		return new Promise((resolve, reject) => {
			window._onGoogleCalendarAuthSuccess = (token) => {
				resolve(token);
			};
			try {
				this.tokenClient.requestAccessToken({ prompt: 'consent' });
			} catch (e) {
				reject(e);
			}
		});
	}

	static async obterAccessTokenValido() {
		if (this.cachedAccessToken && this.estaConectado()) {
			return this.cachedAccessToken;
		}
		return await this.conectar();
	}

	/**
	 * Cria um evento diretamente no Google Calendar do usuário
	 */
	static async criarEventoCalendar(agendamento) {
		try {
			const token = await this.obterAccessTokenValido();
			if (!token) return null;

			const inicio = new Date(`${agendamento.data}T${agendamento.hora}:00`);
			const duracaoMinutos = parseInt(agendamento.duracaoMinutos || 60, 10);
			const fim = new Date(inicio.getTime() + duracaoMinutos * 60000);

			const config = (typeof BrandService !== 'undefined' && BrandService.getConfig) ? BrandService.getConfig() : {};
			const nomeNegocio = config.nomeEstabelecimento || 'Danilo Detailer';

			const eventData = {
				summary: `🚗 [${agendamento.servicos || 'Serviço'}] - ${agendamento.clienteNome || 'Cliente'} (${agendamento.placa || 'Sem Placa'})`,
				description: `Agendamento no ${nomeNegocio}\n` +
					`👤 Cliente: ${agendamento.clienteNome} (${agendamento.clienteTelefone || '-'})\n` +
					`🚗 Veículo: ${agendamento.modelo || '-'} (${agendamento.cor || '-'}) - Placa: ${agendamento.placa}\n` +
					`🛠️ Serviços: ${agendamento.servicos}\n` +
					`💰 Valor Estimado: R$ ${parseFloat(agendamento.valor || 0).toFixed(2)}\n` +
					`📝 Observações: ${agendamento.observacoes || 'Nenhuma'}\n\n` +
					`Gerado pelo Sistema de Gestão ${nomeNegocio}`,
				start: {
					dateTime: inicio.toISOString(),
					timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo'
				},
				end: {
					dateTime: fim.toISOString(),
					timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo'
				},
				reminders: {
					useDefault: false,
					overrides: [
						{ method: 'popup', minutes: 30 },
						{ method: 'popup', minutes: 120 }
					]
				}
			};

			const resp = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(eventData)
			});

			if (!resp.ok) {
				const errBody = await resp.json().catch(() => ({}));
				console.error('Erro na API Calendar:', errBody);
				return null;
			}

			const createdEvent = await resp.json();
			return createdEvent;
		} catch (error) {
			console.error('Falha ao sincronizar com Google Calendar:', error);
			return null;
		}
	}

	/**
	 * Gera um link direto "Adicionar ao Google Calendar" para envio no WhatsApp
	 */
	static gerarLinkWebCalendar(agendamento) {
		if (!agendamento || !agendamento.data || !agendamento.hora) return '#';
		
		const config = (typeof BrandService !== 'undefined' && BrandService.getConfig) ? BrandService.getConfig() : {};
		const nomeNegocio = config.nomeEstabelecimento || 'Danilo Detailer';

		const inicioStr = `${agendamento.data.replace(/-/g, '')}T${agendamento.hora.replace(/:/g, '')}00`;
		const duracaoMin = parseInt(agendamento.duracaoMinutos || 60, 10);
		const dataInicio = new Date(`${agendamento.data}T${agendamento.hora}:00`);
		const dataFim = new Date(dataInicio.getTime() + duracaoMin * 60000);
		
		const anoF = dataFim.getFullYear();
		const mesF = String(dataFim.getMonth() + 1).padStart(2, '0');
		const diaF = String(dataFim.getDate()).padStart(2, '0');
		const horaF = String(dataFim.getHours()).padStart(2, '0');
		const minF = String(dataFim.getMinutes()).padStart(2, '0');
		const fimStr = `${anoF}${mesF}${diaF}T${horaF}${minF}00`;

		const titulo = encodeURIComponent(`🚗 ${agendamento.servicos || 'Serviço Automotivo'} - ${nomeNegocio}`);
		const detalhes = encodeURIComponent(
			`Seu agendamento no ${nomeNegocio} está confirmado!\n` +
			`Veículo: ${agendamento.modelo || ''} (${agendamento.placa || ''})\n` +
			`Serviços: ${agendamento.servicos || ''}\n` +
			`Valor: R$ ${parseFloat(agendamento.valor || 0).toFixed(2)}\n\n` +
			`Aguardamos você!`
		);
		const local = encodeURIComponent(config.endereco || nomeNegocio);

		return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${inicioStr}/${fimStr}&details=${detalhes}&location=${local}`;
	}
}

if (typeof window !== 'undefined') {
	window.GoogleCalendarService = GoogleCalendarService;
}
