const fs = require('fs');

const content = `
					<!-- ==================================================== -->
					<!-- ABA: EQUIPE & COMISSÕES -->
					<!-- ==================================================== -->
					<div id="abaConteudoEquipe" style="display: none;">
						<div class="page-header">
							<h1 class="page-title">Equipe & Relatório de Comissões</h1>
							<p class="page-subtitle">Cadastre lavadores e detailers, defina porcentagens de comissão e apure os valores devidos por período</p>
						</div>

						<!-- Métricas Rápidas -->
						<div class="dashboard-grid" style="margin-bottom: 20px;">
							<div class="stat-card">
								<div class="stat-icon blue">👥</div>
								<div class="stat-info">
									<span class="stat-label">Profissionais Ativos</span>
									<span class="stat-value" id="statTotalEquipe">0</span>
								</div>
							</div>
							<div class="stat-card">
								<div class="stat-icon green">💰</div>
								<div class="stat-info">
									<span class="stat-label">Total de Comissões Apuradas</span>
									<span class="stat-value" id="statTotalComissoes">R$ 0,00</span>
								</div>
							</div>
						</div>

						<!-- Form Novo Membro da Equipe -->
						<div class="content-card">
							<div class="content-card-title">
								<span>➕ Cadastrar Profissional / Lavador</span>
							</div>
							<form id="formNovoMembro" class="form">
								<div class="form-group">
									<label for="membroNome">Nome do Profissional *</label>
									<input type="text" id="membroNome" required placeholder="Ex: Danilo, Lucas, Marcos..." />
								</div>
								<div class="form-group">
									<label for="membroCargo">Função / Cargo</label>
									<input type="text" id="membroCargo" placeholder="Ex: Lavador, Polidor, Detailer" />
								</div>
								<div class="form-group">
									<label for="membroTipoComissao">Tipo de Comissão</label>
									<select id="membroTipoComissao">
										<option value="percentual">Porcentagem sobre o Serviço (%)</option>
										<option value="fixo">Valor Fixo por Carro (R$)</option>
									</select>
								</div>
								<div class="form-group">
									<label for="membroValorComissao">Valor / Taxa (% ou R$) *</label>
									<input type="number" id="membroValorComissao" step="0.5" min="0" required placeholder="Ex: 30" />
								</div>
								<div class="form-actions">
									<button type="submit" class="btn">💾 Cadastrar Profissional</button>
								</div>
							</form>
						</div>

						<!-- Relatório de Produtividade e Comissões -->
						<div class="content-card">
							<div class="content-card-title" style="flex-wrap:wrap; gap:10px;">
								<span>Apuração de Comissões & Serviços Executados</span>
								<div style="display:flex; gap:8px; align-items:center;">
									<input type="date" id="filtroComissaoInicio" style="padding:4px 8px; font-size:0.85rem;" />
									<span style="font-size:0.85rem; color:var(--text-muted);">até</span>
									<input type="date" id="filtroComissaoFim" style="padding:4px 8px; font-size:0.85rem;" />
									<button type="button" class="btn btn-secondary btn-sm" onclick="filtrarComissoes()">Filtrar</button>
								</div>
							</div>
							<div class="table-responsive">
								<table class="tabela">
									<thead>
										<tr>
											<th>Profissional</th>
											<th>Cargo</th>
											<th>Regra Comissão</th>
											<th>Serviços Realizados</th>
											<th>Faturamento Gerado</th>
											<th>Total a Pagar (Comissão)</th>
											<th style="text-align:center;">Ações</th>
										</tr>
									</thead>
									<tbody id="corpoTabelaComissoes">
										<!-- Preenchido via JS -->
									</tbody>
								</table>
							</div>
						</div>
					</div>
`;

let html = fs.readFileSync('configuracoes.html', 'utf8');

// replace </div></div></main> with content + </div></div></main>
html = html.replace(/<\/div>\s*<\/div>\s*<\/main>/g, content + "\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</main>");

fs.writeFileSync('configuracoes.html', html);
