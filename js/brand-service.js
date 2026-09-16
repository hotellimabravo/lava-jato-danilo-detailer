// ==========================================================================
// BrandService: Gerenciamento e Aplicação de Identidade do Negócio
// ==========================================================================

const BrandService = {
	STORAGE_KEY: 'config_negocio',

	// Segmentos pré-configurados com ícone e rótulos
	TIPOS_NEGOCIO: {
		'lava_jato': {
			nome: 'Lava Jato / Estética Automotiva',
			tituloPadrao: 'LAVA JATO',
			icone: '🚗',
			termoItem: 'Veículo',
			termoRegistro: 'Placa / Modelo'
		},
		'barbearia': {
			nome: 'Barbearia / Salão de Beleza',
			tituloPadrao: 'BARBEARIA',
			icone: '💈',
			termoItem: 'Cadeira / Atendimento',
			termoRegistro: 'Agendamento / Cliente'
		},
		'assistencia': {
			nome: 'Assistência Técnica / Celulares e TI',
			tituloPadrao: 'ASSISTÊNCIA TÉCNICA',
			icone: '📱',
			termoItem: 'Aparelho / Equipamento',
			termoRegistro: 'Marca / Modelo / IMEI'
		},
		'mecanica': {
			nome: 'Oficina Mecânica / Auto Peças',
			tituloPadrao: 'OFICINA MECÂNICA',
			icone: '🔧',
			termoItem: 'Veículo / Motor',
			termoRegistro: 'Placa / Chassi'
		},
		'petshop': {
			nome: 'Pet Shop / Banho e Tosa',
			tituloPadrao: 'PET SHOP',
			icone: '🐾',
			termoItem: 'Pet / Animal',
			termoRegistro: 'Nome do Pet / Raça'
		},
		'geral': {
			nome: 'Outro Segmento / Geral',
			tituloPadrao: 'OUTRO SEGMENTO',
			icone: '🛠️',
			termoItem: 'Atendimento',
			termoRegistro: 'Referência / Item'
		}
	},

	// Retorna a configuração atual com fallback para o padrão
	getConfig: function () {
		try {
			const salvo = localStorage.getItem(this.STORAGE_KEY);
			if (salvo) {
				const config = JSON.parse(salvo);
				if (config && typeof config === 'object') {
					return {
						nomeEstabelecimento: config.nomeEstabelecimento || '',
						razaoSocial: config.razaoSocial || '',
						cnpj: config.cnpj || '',
						tipoNegocio: config.tipoNegocio || 'geral',
						tipoNegocioCustom: config.tipoNegocioCustom || '',
						telefone: config.telefone || '',
						endereco: config.endereco || '',
						responsavel: config.responsavel || '',
						iconeCustom: config.iconeCustom || ''
					};
				}
			}
		} catch (e) {
			console.error('Erro ao ler config_negocio:', e);
		}

		return {
			nomeEstabelecimento: '',
			razaoSocial: '',
			cnpj: '',
			tipoNegocio: 'geral',
			tipoNegocioCustom: '',
			telefone: '',
			endereco: '',
			responsavel: '',
			iconeCustom: ''
		};
	},

	// Salva a configuração no localStorage
	salvarConfig: function (dados) {
		const configAtual = this.getConfig();
		const novaConfig = {
			...configAtual,
			...dados,
			atualizadoEm: new Date().toISOString()
		};

		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(novaConfig));
		this.aplicarIdentidadeVisual();
		return novaConfig;
	},

	// Obtém o título do segmento e o ícone correspondente
	getInfoVisual: function (config) {
		const cfg = config || this.getConfig();
		const infoTipo = this.TIPOS_NEGOCIO[cfg.tipoNegocio] || this.TIPOS_NEGOCIO['geral'];

		let tituloNegocio = infoTipo.tituloPadrao;
		if (cfg.tipoNegocioCustom && cfg.tipoNegocioCustom.trim().length > 0) {
			tituloNegocio = cfg.tipoNegocioCustom.trim().toUpperCase();
		}

		let icone = cfg.iconeCustom || infoTipo.icone;

		return {
			titulo: tituloNegocio,
			subtitulo: (cfg.nomeEstabelecimento && cfg.nomeEstabelecimento.trim()) ? cfg.nomeEstabelecimento.trim() : 'SEU NEGÓCIO',
			icone: icone,
			infoTipo: infoTipo
		};
	},

	// Aplica dinamicamente no cabeçalho de qualquer página
	aplicarIdentidadeVisual: function () {
		const visual = this.getInfoVisual();

		// Atualiza o logotipo
		const elLogo = document.querySelector('.brand-logo');
		if (elLogo) {
			elLogo.textContent = visual.icone;
		}

		// Atualiza o brand-title e brand-subtitle
		const elBrandTitle = document.querySelector('.brand-title');
		if (elBrandTitle) {
			const spanTitulo = elBrandTitle.querySelector('span:first-child') || elBrandTitle.childNodes[0];
			const elSubtitle = elBrandTitle.querySelector('.brand-subtitle');

			if (spanTitulo && spanTitulo !== elSubtitle) {
				spanTitulo.textContent = visual.titulo;
			} else {
				// Se a estrutura estiver simplificada, recria de forma limpa
				elBrandTitle.innerHTML = `<span>${visual.titulo}</span><span class="brand-subtitle">${visual.subtitulo}</span>`;
				return;
			}

			if (elSubtitle) {
				elSubtitle.textContent = visual.subtitulo;
			}
		}

		// Opcional: atualiza o título da aba do navegador (<title>) se aplicável
		const titleEl = document.querySelector('title');
		if (titleEl && visual.subtitulo) {
			const partes = titleEl.textContent.split('|');
			if (partes.length > 1) {
				titleEl.textContent = `${partes[0].trim()} | ${visual.subtitulo}`;
			}
		}
	}
};

// Executa imediatamente e no DOMContentLoaded para evitar piscadas
if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => BrandService.aplicarIdentidadeVisual());
	} else {
		BrandService.aplicarIdentidadeVisual();
	}
}

if (typeof window !== 'undefined') {
	window.BrandService = BrandService;
}
