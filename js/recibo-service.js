// ==========================================================================
// ReciboService: Gerador e Emissor de Recibo Estilo Cupom Fiscal Térmico
// ==========================================================================

const ReciboService = {
	/**
	 * Formata um número como moeda brasileira (R$)
	 */
	formatarMoeda: function (valor) {
		const num = parseFloat(valor) || 0;
		return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	},

	/**
	 * Formata data ISO (AAAA-MM-DD) para DD/MM/AAAA
	 */
	formatarData: function (dataISO) {
		if (!dataISO) return '--/--/----';
		if (dataISO.includes('/')) return dataISO;
		const partes = dataISO.split('-');
		if (partes.length === 3) {
			return `${partes[2]}/${partes[1]}/${partes[0]}`;
		}
		return dataISO;
	},

	/**
	 * Monta o HTML completo do cupom fiscal / comprovante
	 */
	gerarCupomHTML: function (pedido) {
		if (!pedido) return '';

		const config = (typeof BrandService !== 'undefined' && BrandService.getConfig)
			? BrandService.getConfig()
			: (JSON.parse(localStorage.getItem('config_negocio')) || {});

		const visual = (typeof BrandService !== 'undefined' && BrandService.getInfoVisual)
			? BrandService.getInfoVisual(config)
			: {
				titulo: config.tipoNegocioCustom || 'SERVIÇOS',
				subtitulo: config.nomeEstabelecimento || 'SEU NEGÓCIO',
				icone: config.iconeCustom || '🧾'
			};

		const nomeFantasia = (config.nomeEstabelecimento && config.nomeEstabelecimento.trim()) 
			? config.nomeEstabelecimento.trim().toUpperCase() 
			: 'SEU NEGÓCIO';
		const razaoSocial = (config.razaoSocial && config.razaoSocial.trim()) 
			? config.razaoSocial.trim() 
			: '';
		const cnpj = config.cnpj || '';
		const telefone = config.telefone || '';
		const endereco = config.endereco || '';

		const dataEmissao = this.formatarData(pedido.dataEncerramento || pedido.data || '');
		const horaEmissao = pedido.horaEncerramento || pedido.horaEntrada || '';
		const dataEntrada = this.formatarData(pedido.data || '');
		const horaEntrada = pedido.horaEntrada || '--:--';

		const numOS = (pedido.id || '').replace(/^os_/, '').slice(-6) || '000001';
		const valorFinal = parseFloat(pedido.valor || 0);

		// Lista de serviços discriminados
		const servicosLista = (pedido.servicos || '')
			.split(',')
			.map(s => s.trim())
			.filter(Boolean);

		// Recupera preços cadastrados se houver para exibir por item
		const servicosCadastrados = JSON.parse(localStorage.getItem('servicos')) || [];
		let linhasItensHTML = '';

		if (servicosLista.length > 0) {
			servicosLista.forEach((itemNome, idx) => {
				const itemCadastrado = servicosCadastrados.find(
					sc => sc.nome && sc.nome.trim().toLowerCase() === itemNome.toLowerCase()
				);
				const precoUnit = itemCadastrado ? parseFloat(itemCadastrado.preco || 0) : null;
				const precoTexto = precoUnit !== null ? this.formatarMoeda(precoUnit) : '';

				linhasItensHTML += `
					<div class="cupom-item-row">
						<span class="cupom-item-num">${String(idx + 1).padStart(2, '0')}</span>
						<span class="cupom-item-desc">${this.escaparHTML(itemNome)}</span>
						<span class="cupom-item-val">${precoTexto}</span>
					</div>
				`;
			});
		} else {
			linhasItensHTML = `
				<div class="cupom-item-row">
					<span class="cupom-item-num">01</span>
					<span class="cupom-item-desc">Serviços Prestados</span>
					<span class="cupom-item-val">${this.formatarMoeda(valorFinal)}</span>
				</div>
			`;
		}

		// Detalhes do item/veículo atendido
		const placa = pedido.placa || 'SEM IDENTIFICAÇÃO';
		const cor = pedido.cor ? pedido.cor.toUpperCase() : '';
		const modelo = pedido.modelo ? pedido.modelo.toUpperCase() : '';
		let linhaVeiculo = placa;
		if (cor || modelo) {
			linhaVeiculo += ` (${[modelo, cor].filter(Boolean).join(' - ')})`;
		}

		const clienteNome = (pedido.cliente || 'CONSUMIDOR NÃO IDENTIFICADO').toUpperCase();

		return `
			<div class="cupom-fiscal-container" id="cupomImpressaoArea">
				<!-- Cabeçalho da Empresa -->
				<div class="cupom-header">
					<div class="cupom-logo-icone">${visual.icone}</div>
					<h1 class="cupom-empresa-nome">${this.escaparHTML(nomeFantasia)}</h1>
					${razaoSocial ? `<div class="cupom-empresa-sub">${this.escaparHTML(razaoSocial)}</div>` : ''}
					${cnpj ? `<div class="cupom-empresa-info">CNPJ/CPF: ${this.escaparHTML(cnpj)}</div>` : ''}
					${endereco ? `<div class="cupom-empresa-info">${this.escaparHTML(endereco)}</div>` : ''}
					${telefone ? `<div class="cupom-empresa-info">TEL: ${this.escaparHTML(telefone)}</div>` : ''}
				</div>

				<div class="cupom-divider-dashed"></div>

				<!-- Título do Documento -->
				<div class="cupom-doc-title">
					<strong>COMPROVANTE DE PAGAMENTO / RECIBO</strong>
					<span>DOCUMENTO NÃO FISCAL</span>
				</div>

				<div class="cupom-divider-dashed"></div>

				<!-- Metadados da O.S. -->
				<div class="cupom-section">
					<div class="cupom-row">
						<span>ORDEM DE SERVIÇO:</span>
						<strong>#${numOS}</strong>
					</div>
					<div class="cupom-row">
						<span>EMISSÃO / SAÍDA:</span>
						<span>${dataEmissao} às ${horaEmissao || '--:--'}</span>
					</div>
					<div class="cupom-row">
						<span>ENTRADA:</span>
						<span>${dataEntrada} às ${horaEntrada}</span>
					</div>
					<div class="cupom-row">
						<span>ITEM / PLACA:</span>
						<strong>${this.escaparHTML(linhaVeiculo)}</strong>
					</div>
					<div class="cupom-row">
						<span>CLIENTE:</span>
						<span>${this.escaparHTML(clienteNome)}</span>
					</div>
				</div>

				<div class="cupom-divider-solid"></div>

				<!-- Tabela de Itens / Serviços -->
				<div class="cupom-itens-header">
					<span>ITEM</span>
					<span style="flex:1; padding-left:6px;">DESCRIÇÃO</span>
					<span style="text-align:right;">VALOR</span>
				</div>
				<div class="cupom-divider-dotted"></div>

				<div class="cupom-itens-list">
					${linhasItensHTML}
				</div>

				<div class="cupom-divider-solid"></div>

				<!-- Totais e Pagamento -->
				<div class="cupom-totais">
					<div class="cupom-row cupom-total-destaque">
						<span>VALOR TOTAL:</span>
						<strong>${this.formatarMoeda(valorFinal)}</strong>
					</div>
					<div class="cupom-row" style="margin-top: 4px;">
						<span>FORMA DE PAGAMENTO:</span>
						<strong>${this.escaparHTML((pedido.formaPagamento || 'Pix').toUpperCase())}</strong>
					</div>
					<div class="cupom-row">
						<span>VALOR RECEBIDO:</span>
						<span>${this.formatarMoeda(valorFinal)}</span>
					</div>
					<div class="cupom-row">
						<span>SITUAÇÃO:</span>
						<strong style="color: #047857;">QUITADO / PAGO ✅</strong>
					</div>
				</div>

				<div class="cupom-divider-dashed"></div>

				<!-- Rodapé com Mensagem de Agradecimento e Assinatura -->
				<div class="cupom-footer">
					<p class="cupom-msg-agradecimento">OBRIGADO PELA PREFERÊNCIA!</p>
					<p class="cupom-volte-sempre">Volte Sempre!</p>
					
					<div class="cupom-assinatura-box">
						<div class="cupom-linha-assinatura"></div>
						<span>Assinatura do Responsável</span>
					</div>

					<div class="cupom-timestamp">
						Impresso em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
					</div>
				</div>
			</div>
		`;
	},

	/**
	 * Dispara a impressão limpa do cupom na impressora (inclusive térmicas de 80mm/58mm)
	 */
	imprimirCupom: function (pedido) {
		if (!pedido) return;

		// Cria um container invisível ou janela dedicada para impressão
		const htmlCupom = this.gerarCupomHTML(pedido);

		// Cria iframe invisível isolado para garantir estilos de impressão perfeitos
		let printFrame = document.getElementById('iframeImpressaoRecibo');
		if (!printFrame) {
			printFrame = document.createElement('iframe');
			printFrame.id = 'iframeImpressaoRecibo';
			printFrame.style.position = 'fixed';
			printFrame.style.right = '0';
			printFrame.style.bottom = '0';
			printFrame.style.width = '0';
			printFrame.style.height = '0';
			printFrame.style.border = '0';
			document.body.appendChild(printFrame);
		}

		const doc = printFrame.contentWindow.document;
		doc.open();
		doc.write(`
			<!DOCTYPE html>
			<html lang="pt-BR">
			<head>
				<meta charset="UTF-8" />
				<title>Recibo - O.S. #${(pedido.id || '').replace(/^os_/, '').slice(-6)}</title>
				<style>
					@page {
						size: auto;
						margin: 0;
					}
					* {
						box-sizing: border-box;
						margin: 0;
						padding: 0;
						-webkit-print-color-adjust: exact;
						print-color-adjust: exact;
					}
					body {
						font-family: 'Courier New', Courier, monospace, 'Lucida Console', Monaco;
						font-size: 11px;
						line-height: 1.35;
						color: #000;
						background: #fff;
						padding: 8px 6px;
						width: 100%;
						max-width: 320px; /* Padrão internacional de bobina térmica 80mm / 3 polegadas */
						margin: 0 auto;
					}
					.cupom-fiscal-container {
						width: 100%;
						padding: 4px;
					}
					.cupom-header {
						text-align: center;
						margin-bottom: 6px;
					}
					.cupom-logo-icone {
						font-size: 22px;
						margin-bottom: 2px;
					}
					.cupom-empresa-nome {
						font-size: 14px;
						font-weight: 800;
						text-transform: uppercase;
						letter-spacing: 0.5px;
						margin-bottom: 2px;
					}
					.cupom-empresa-sub {
						font-size: 10px;
						font-weight: 600;
						margin-bottom: 2px;
					}
					.cupom-empresa-info {
						font-size: 9px;
						line-height: 1.25;
					}
					.cupom-divider-dashed {
						border-top: 1px dashed #000;
						margin: 6px 0;
					}
					.cupom-divider-solid {
						border-top: 1px solid #000;
						margin: 6px 0;
					}
					.cupom-divider-dotted {
						border-top: 1px dotted #000;
						margin: 4px 0;
					}
					.cupom-doc-title {
						text-align: center;
						margin: 4px 0;
					}
					.cupom-doc-title strong {
						display: block;
						font-size: 11px;
						font-weight: 800;
						letter-spacing: 0.5px;
					}
					.cupom-doc-title span {
						font-size: 9px;
						font-weight: normal;
					}
					.cupom-section {
						margin: 4px 0;
						font-size: 10px;
					}
					.cupom-row {
						display: flex;
						justify-content: space-between;
						align-items: flex-start;
						margin-bottom: 2px;
					}
					.cupom-row span:first-child {
						font-weight: 600;
					}
					.cupom-itens-header {
						display: flex;
						justify-content: space-between;
						font-size: 10px;
						font-weight: 800;
						margin-bottom: 2px;
					}
					.cupom-itens-list {
						margin: 4px 0;
					}
					.cupom-item-row {
						display: flex;
						justify-content: space-between;
						font-size: 10px;
						margin-bottom: 3px;
					}
					.cupom-item-num {
						width: 18px;
						font-weight: 700;
					}
					.cupom-item-desc {
						flex: 1;
						padding: 0 4px;
						word-break: break-word;
					}
					.cupom-item-val {
						text-align: right;
						white-space: nowrap;
						font-weight: 700;
					}
					.cupom-totais {
						margin: 6px 0;
						font-size: 10px;
					}
					.cupom-total-destaque {
						font-size: 13px;
						font-weight: 800;
						margin-bottom: 4px;
					}
					.cupom-footer {
						text-align: center;
						margin-top: 8px;
						font-size: 9px;
					}
					.cupom-msg-agradecimento {
						font-weight: 800;
						font-size: 10px;
						letter-spacing: 0.5px;
					}
					.cupom-volte-sempre {
						font-size: 9px;
						margin-top: 2px;
					}
					.cupom-assinatura-box {
						margin: 22px auto 6px auto;
						width: 75%;
						text-align: center;
					}
					.cupom-linha-assinatura {
						border-top: 1px solid #000;
						margin-bottom: 2px;
					}
					.cupom-timestamp {
						font-size: 8px;
						color: #333;
						margin-top: 6px;
					}
				</style>
			</head>
			<body>
				${htmlCupom}
			</body>
			</html>
		`);
		doc.close();

		setTimeout(() => {
			printFrame.contentWindow.focus();
			printFrame.contentWindow.print();
		}, 300);
	},

	/**
	 * Utilitário de escape de strings para HTML seguro
	 */
	escaparHTML: function (str) {
		if (!str) return '';
		return str
			.toString()
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}
};

if (typeof window !== 'undefined') {
	window.ReciboService = ReciboService;
}
