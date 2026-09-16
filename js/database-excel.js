// ==========================================================================
// Módulo de Gerenciamento de Banco de Dados via Planilha Excel (XLSX)
// ==========================================================================

class DatabaseExcelService {
	static getEstatisticasAtuais() {
		const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
		const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
		const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
		const caixas = JSON.parse(localStorage.getItem('caixas_fechados')) || [];
		const infoDb = JSON.parse(localStorage.getItem('database_origem_info')) || null;

		return {
			totalClientes: clientes.length,
			totalServicos: servicos.length,
			totalPedidos: pedidos.length,
			pedidosPatio: pedidos.filter(p => p.status === 'aberto').length,
			pedidosEncerrados: pedidos.filter(p => p.status === 'encerrado').length,
			totalCaixas: caixas.length,
			infoDb: infoDb
		};
	}

	// ----------------------------------------------------------------------
	// Exportação Completa para Planilha Excel (.xlsx)
	// ----------------------------------------------------------------------
	static exportarBaseCompleta() {
		if (typeof XLSX === 'undefined') {
			throw new Error('A biblioteca SheetJS/XLSX não foi carregada.');
		}

		const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
		const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
		const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
		const caixas = JSON.parse(localStorage.getItem('caixas_fechados')) || [];
		const caixaAtual = JSON.parse(localStorage.getItem('caixa_atual')) || null;

		// 1. Aba Clientes
		const dadosClientes = clientes.map(c => ({
			'Nome do Cliente': c.nome || '',
			'Telefone (Código ID)': c.tel1 || '',
			'WhatsApp Principal': c.wpp1 || '',
			'Telefone Secundário': c.tel2 || '',
			'WhatsApp Secundário': c.wpp2 || '',
			'Endereço': c.endereco || ''
		}));

		// 2. Aba Serviços
		const dadosServicos = servicos.map(s => ({
			'Nome do Serviço': s.nome || '',
			'Preço (R$)': s.preco !== undefined ? parseFloat(s.preco) : 0,
			'Descrição': s.descricao || ''
		}));

		// 3. Aba Pedidos / Ordens de Serviço
		const dadosPedidos = pedidos.map(p => ({
			'ID': p.id || '',
			'Placa': p.placa || '',
			'Cor do Veículo': p.cor || 'prata',
			'Modelo': p.modelo || '',
			'Cliente': p.cliente || '',
			'Serviços': p.servicos || '',
			'Valor Total (R$)': p.valor !== undefined ? parseFloat(p.valor) : 0,
			'Status': p.status || 'encerrado',
			'Data Entrada': p.data || '',
			'Hora Entrada': p.horaEntrada || '',
			'Data Saída': p.dataEncerramento || '',
			'Hora Saída': p.horaEncerramento || '',
			'Forma de Pagamento': p.formaPagamento || ''
		}));

		// 4. Aba Livro Caixa
		const dadosCaixas = caixas.map(cx => ({
			'Data': cx.data || '',
			'Status': cx.status || 'fechado',
			'Tipo': cx.automatico ? 'Automático (Virada)' : 'Manual',
			'Hora Fechamento': cx.horaFechamento || '',
			'Qtd Carros': cx.totalServicos || 0,
			'Total Arrecadado (R$)': cx.totalValor !== undefined ? parseFloat(cx.totalValor) : 0,
			'Fundo de Troco (R$)': cx.fundoTroco !== undefined ? parseFloat(cx.fundoTroco) : 0,
			'Pix (R$)': (cx.breakdown && cx.breakdown['Pix']) || 0,
			'Dinheiro (R$)': (cx.breakdown && cx.breakdown['Dinheiro']) || 0,
			'Cartão de Crédito (R$)': (cx.breakdown && cx.breakdown['Cartão de Crédito']) || 0,
			'Cartão de Débito (R$)': (cx.breakdown && cx.breakdown['Cartão de Débito']) || 0,
			'A Prazo (R$)': (cx.breakdown && cx.breakdown['A Prazo / Fiado']) || 0,
			'Outro (R$)': (cx.breakdown && cx.breakdown['Outro']) || 0,
			'Observações': cx.observacoes || cx.motivoFechamento || ''
		}));

		// 5. Aba Informações e Metadados do Sistema
		const dataExport = new Date();
		const dadosMeta = [
			{ 'Propriedade': 'Sistema', 'Valor': 'Lava Jato - Danilo Detailer' },
			{ 'Propriedade': 'Data da Exportação', 'Valor': dataExport.toLocaleDateString('pt-BR') + ' ' + dataExport.toLocaleTimeString('pt-BR') },
			{ 'Propriedade': 'Total de Clientes', 'Valor': clientes.length },
			{ 'Propriedade': 'Total de Serviços', 'Valor': servicos.length },
			{ 'Propriedade': 'Total de Ordens de Serviço', 'Valor': pedidos.length },
			{ 'Propriedade': 'Total de Fechamentos de Caixa', 'Valor': caixas.length },
			{ 'Propriedade': 'Formato', 'Valor': 'Database Local Excel (.xlsx)' }
		];

		// Criar Workbook
		const wb = XLSX.utils.book_new();

		const wsClientes = XLSX.utils.json_to_sheet(dadosClientes.length ? dadosClientes : [{}]);
		const wsServicos = XLSX.utils.json_to_sheet(dadosServicos.length ? dadosServicos : [{}]);
		const wsPedidos = XLSX.utils.json_to_sheet(dadosPedidos.length ? dadosPedidos : [{}]);
		const wsCaixas = XLSX.utils.json_to_sheet(dadosCaixas.length ? dadosCaixas : [{}]);
		const wsMeta = XLSX.utils.json_to_sheet(dadosMeta);

		XLSX.utils.book_append_sheet(wb, wsPedidos, 'Pedidos_OS');
		XLSX.utils.book_append_sheet(wb, wsClientes, 'Clientes');
		XLSX.utils.book_append_sheet(wb, wsServicos, 'Servicos');
		XLSX.utils.book_append_sheet(wb, wsCaixas, 'Livro_Caixa');
		XLSX.utils.book_append_sheet(wb, wsMeta, 'Metadados');

		// Nome do arquivo com timestamp
		const timestamp = dataExport.toISOString().replace(/[:.]/g, '-').slice(0, 19);
		const nomeArquivo = `database_lavajato_${timestamp}.xlsx`;

		XLSX.writeFile(wb, nomeArquivo);

		// Atualiza metadado de último backup exportado
		const infoAtual = JSON.parse(localStorage.getItem('database_origem_info')) || {};
		infoAtual.ultimoBackupExportado = new Date().toISOString();
		infoAtual.ultimoArquivoExportado = nomeArquivo;
		localStorage.setItem('database_origem_info', JSON.stringify(infoAtual));

		return nomeArquivo;
	}

	// ----------------------------------------------------------------------
	// Baixar Planilha Modelo / Exemplo Limpo
	// ----------------------------------------------------------------------
	static baixarModeloExemplo() {
		if (typeof XLSX === 'undefined') {
			throw new Error('A biblioteca SheetJS/XLSX não foi carregada.');
		}

		const modeloClientes = [
			{ 'Nome do Cliente': 'João da Silva', 'Telefone (Código ID)': '(11) 99999-1111', 'WhatsApp Principal': '✅', 'Telefone Secundário': '', 'WhatsApp Secundário': '❌', 'Endereço': 'Rua das Palmeiras, 100' },
			{ 'Nome do Cliente': 'Maria Oliveira', 'Telefone (Código ID)': '(11) 98888-2222', 'WhatsApp Principal': '✅', 'Telefone Secundário': '', 'WhatsApp Secundário': '❌', 'Endereço': 'Av. Central, 450' }
		];

		const modeloServicos = [
			{ 'Nome do Serviço': 'Lavagem Simples', 'Preço (R$)': 40.0, 'Descrição': 'Externa com secagem e pretinho' },
			{ 'Nome do Serviço': 'Lavagem Completa', 'Preço (R$)': 70.0, 'Descrição': 'Externa, interna aspirada e acabamento' },
			{ 'Nome do Serviço': 'Higienização Interna', 'Preço (R$)': 180.0, 'Descrição': 'Estofados, forro de teto e carpetes' }
		];

		const modeloPedidos = [
			{ 'ID': 'os_exemplo_1', 'Placa': 'BRA2E19', 'Cor do Veículo': 'preto', 'Modelo': 'Honda Civic', 'Cliente': 'João da Silva', 'Serviços': 'Lavagem Completa', 'Valor Total (R$)': 70.0, 'Status': 'encerrado', 'Data Entrada': '2026-09-15', 'Hora Entrada': '09:00', 'Data Saída': '2026-09-15', 'Hora Saída': '10:30', 'Forma de Pagamento': 'Pix' },
			{ 'ID': 'os_exemplo_2', 'Placa': 'ABC1D23', 'Cor do Veículo': 'vermelho', 'Modelo': 'Jeep Compass', 'Cliente': 'Maria Oliveira', 'Serviços': 'Lavagem Simples', 'Valor Total (R$)': 40.0, 'Status': 'aberto', 'Data Entrada': '2026-09-16', 'Hora Entrada': '08:15', 'Data Saída': '', 'Hora Saída': '', 'Forma de Pagamento': '' }
		];

		const modeloCaixas = [
			{ 'Data': '2026-09-15', 'Status': 'fechado', 'Tipo': 'Manual', 'Hora Fechamento': '18:00', 'Qtd Carros': 1, 'Total Arrecadado (R$)': 70.0, 'Fundo de Troco (R$)': 50.0, 'Pix (R$)': 70.0, 'Dinheiro (R$)': 0, 'Cartão de Crédito (R$)': 0, 'Cartão de Débito (R$)': 0, 'A Prazo (R$)': 0, 'Outro (R$)': 0, 'Observações': 'Dia normal' }
		];

		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(modeloPedidos), 'Pedidos_OS');
		XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(modeloClientes), 'Clientes');
		XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(modeloServicos), 'Servicos');
		XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(modeloCaixas), 'Livro_Caixa');

		XLSX.writeFile(wb, 'modelo_database_lavajato.xlsx');
	}

	// ----------------------------------------------------------------------
	// Leitura e Importação de Arquivo Excel (.xlsx)
	// ----------------------------------------------------------------------
	static async importarArquivoExcel(file, modo = 'substituir') {
		if (typeof XLSX === 'undefined') {
			throw new Error('Biblioteca XLSX não carregada no navegador.');
		}

		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					const data = new Uint8Array(e.target.result);
					const workbook = XLSX.read(data, { type: 'array' });

					const resultado = {
						arquivoNome: file.name,
						tamanhoBytes: file.size,
						clientesLidos: 0,
						servicosLidos: 0,
						pedidosLidos: 0,
						caixasLidos: 0,
						abasEncontradas: workbook.SheetNames
					};

					// 1. Processar Clientes
					const sheetClientesNome = workbook.SheetNames.find(n => 
						n.toLowerCase().includes('cliente')
					);
					let novosClientes = [];
					if (sheetClientesNome) {
						const sheet = workbook.Sheets[sheetClientesNome];
						const json = XLSX.utils.sheet_to_json(sheet);
						novosClientes = json.map(r => ({
							nome: String(r['Nome do Cliente'] || r['Nome'] || r['nome'] || '').trim(),
							tel1: String(r['Telefone (Código ID)'] || r['Telefone 1'] || r['Telefone'] || r['tel1'] || r['telefone'] || '').trim(),
							wpp1: String(r['WhatsApp Principal'] || r['WhatsApp 1'] || r['WhatsApp'] || r['wpp1'] || '❌').trim(),
							tel2: String(r['Telefone Secundário'] || r['Telefone 2'] || r['tel2'] || '').trim(),
							wpp2: String(r['WhatsApp Secundário'] || r['WhatsApp 2'] || r['wpp2'] || '❌').trim(),
							endereco: String(r['Endereço'] || r['Endereco'] || r['endereco'] || '').trim()
						})).filter(c => c.nome.length > 0 || c.tel1.length > 0);
						resultado.clientesLidos = novosClientes.length;
					}

					// 2. Processar Serviços
					const sheetServicosNome = workbook.SheetNames.find(n => 
						n.toLowerCase().includes('servico') || n.toLowerCase().includes('serviço')
					);
					let novosServicos = [];
					if (sheetServicosNome) {
						const sheet = workbook.Sheets[sheetServicosNome];
						const json = XLSX.utils.sheet_to_json(sheet);
						novosServicos = json.map(r => ({
							nome: String(r['Nome do Serviço'] || r['Serviço'] || r['Servico'] || r['nome'] || '').trim(),
							preco: parseFloat(r['Preço (R$)'] || r['Preco (R$)'] || r['Preço'] || r['preco'] || 0),
							descricao: String(r['Descrição'] || r['Descricao'] || r['descricao'] || '').trim()
						})).filter(s => s.nome.length > 0);
						resultado.servicosLidos = novosServicos.length;
					}

					// 3. Processar Pedidos / Ordens de Serviço
					const sheetPedidosNome = workbook.SheetNames.find(n => 
						n.toLowerCase().includes('pedido') || n.toLowerCase().includes('os') || n.toLowerCase().includes('ordem')
					);
					let novosPedidos = [];
					if (sheetPedidosNome) {
						const sheet = workbook.Sheets[sheetPedidosNome];
						const json = XLSX.utils.sheet_to_json(sheet);
						novosPedidos = json.map((r, idx) => {
							const id = r['ID'] || r['id'] || ('os_imp_' + Date.now() + '_' + idx);
							const status = String(r['Status'] || r['status'] || 'encerrado').toLowerCase().includes('abert') ? 'aberto' : 'encerrado';
							return {
								id: String(id),
								placa: String(r['Placa'] || r['placa'] || 'SEM PLACA').toUpperCase().trim(),
								cor: String(r['Cor do Veículo'] || r['Cor'] || r['cor'] || 'prata').toLowerCase().trim(),
								modelo: String(r['Modelo'] || r['modelo'] || '').trim(),
								cliente: String(r['Cliente'] || r['cliente'] || '').trim(),
								servicos: String(r['Serviços'] || r['Servicos'] || r['servicos'] || '').trim(),
								valor: parseFloat(r['Valor Total (R$)'] || r['Valor'] || r['valor'] || 0),
								status: status,
								data: String(r['Data Entrada'] || r['Data'] || r['data'] || '').trim(),
								horaEntrada: String(r['Hora Entrada'] || r['horaEntrada'] || '').trim(),
								dataEncerramento: String(r['Data Saída'] || r['Data Encerramento'] || r['dataEncerramento'] || '').trim(),
								horaEncerramento: String(r['Hora Saída'] || r['Hora Encerramento'] || r['horaEncerramento'] || '').trim(),
								formaPagamento: String(r['Forma de Pagamento'] || r['formaPagamento'] || '').trim()
							};
						}).filter(p => p.cliente.length > 0 || p.placa.length > 0);
						resultado.pedidosLidos = novosPedidos.length;
					}

					// 4. Processar Livro Caixa
					const sheetCaixasNome = workbook.SheetNames.find(n => 
						n.toLowerCase().includes('caixa') || n.toLowerCase().includes('livro')
					);
					let novosCaixas = [];
					if (sheetCaixasNome) {
						const sheet = workbook.Sheets[sheetCaixasNome];
						const json = XLSX.utils.sheet_to_json(sheet);
						novosCaixas = json.map(r => {
							const pix = parseFloat(r['Pix (R$)'] || r['Pix'] || 0);
							const dinheiro = parseFloat(r['Dinheiro (R$)'] || r['Dinheiro'] || 0);
							const credito = parseFloat(r['Cartão de Crédito (R$)'] || r['Crédito'] || 0);
							const debito = parseFloat(r['Cartão de Débito (R$)'] || r['Débito'] || 0);
							const prazo = parseFloat(r['A Prazo (R$)'] || r['A Prazo'] || 0);
							const outro = parseFloat(r['Outro (R$)'] || r['Outro'] || 0);

							return {
								data: String(r['Data'] || r['data'] || '').trim(),
								status: 'fechado',
								automatico: String(r['Tipo'] || '').toLowerCase().includes('auto'),
								horaFechamento: String(r['Hora Fechamento'] || r['hora'] || '18:00').trim(),
								totalServicos: parseInt(r['Qtd Carros'] || r['totalServicos'] || 0, 10),
								totalValor: parseFloat(r['Total Arrecadado (R$)'] || r['Total Arrecadado'] || r['totalValor'] || 0),
								fundoTroco: parseFloat(r['Fundo de Troco (R$)'] || r['fundoTroco'] || 0),
								breakdown: {
									'Pix': pix,
									'Dinheiro': dinheiro,
									'Cartão de Crédito': credito,
									'Cartão de Débito': debito,
									'A Prazo / Fiado': prazo,
									'Outro': outro
								},
								observacoes: String(r['Observações'] || r['observacoes'] || '').trim(),
								dataRegistro: new Date().toISOString()
							};
						}).filter(cx => cx.data.length > 0);
						resultado.caixasLidos = novosCaixas.length;
					}

					// Gravação no banco de dados local com base no modo
					if (modo === 'substituir') {
						if (novosClientes.length > 0) localStorage.setItem('clientes', JSON.stringify(novosClientes));
						if (novosServicos.length > 0) localStorage.setItem('servicos', JSON.stringify(novosServicos));
						if (novosPedidos.length > 0) localStorage.setItem('pedidos', JSON.stringify(novosPedidos));
						if (novosCaixas.length > 0) localStorage.setItem('caixas_fechados', JSON.stringify(novosCaixas));
					} else {
						// Modo mesclar
						const clientesAtuais = JSON.parse(localStorage.getItem('clientes')) || [];
						novosClientes.forEach(nc => {
							if (!clientesAtuais.some(c => c.nome.toLowerCase() === nc.nome.toLowerCase())) {
								clientesAtuais.push(nc);
							}
						});
						localStorage.setItem('clientes', JSON.stringify(clientesAtuais));

						const servicosAtuais = JSON.parse(localStorage.getItem('servicos')) || [];
						novosServicos.forEach(ns => {
							if (!servicosAtuais.some(s => s.nome.toLowerCase() === ns.nome.toLowerCase())) {
								servicosAtuais.push(ns);
							}
						});
						localStorage.setItem('servicos', JSON.stringify(servicosAtuais));

						const pedidosAtuais = JSON.parse(localStorage.getItem('pedidos')) || [];
						novosPedidos.forEach(np => {
							if (!pedidosAtuais.some(p => p.id === np.id)) {
								pedidosAtuais.push(np);
							}
						});
						localStorage.setItem('pedidos', JSON.stringify(pedidosAtuais));

						const caixasAtuais = JSON.parse(localStorage.getItem('caixas_fechados')) || [];
						novosCaixas.forEach(ncx => {
							if (!caixasAtuais.some(cx => cx.data === ncx.data)) {
								caixasAtuais.push(ncx);
							}
						});
						localStorage.setItem('caixas_fechados', JSON.stringify(caixasAtuais));
					}

					// Salvar metadados da base ativa
					const infoBase = {
						nomeArquivo: file.name,
						dataImportacao: new Date().toISOString(),
						tamanhoBytes: file.size,
						modo: modo,
						registrosCarregados: resultado
					};
					localStorage.setItem('database_origem_info', JSON.stringify(infoBase));

					resolve(resultado);
				} catch (err) {
					reject(err);
				}
			};

			reader.onerror = (err) => reject(err);
			reader.readAsArrayBuffer(file);
		});
	}
}

window.DatabaseExcelService = DatabaseExcelService;
