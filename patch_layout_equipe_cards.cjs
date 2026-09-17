const fs = require('fs');

let html = fs.readFileSync('configuracoes.html', 'utf8');

const regexToReplace = /<div id="abaConteudoEquipe" style="display: none;">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/main>/;

const newContent = `<div id="abaConteudoEquipe" style="display: none;">
						<div class="settings-section-card">
							<div class="settings-section-header" style="flex-wrap: wrap; gap: 10px;">
								<h2 class="settings-section-title">
									<span>💼 Equipe & Comissões</span>
								</h2>
							</div>
							<p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 20px;">
								Cadastre lavadores, defina comissões e apure os valores devidos por período.
							</p>

							<!-- Métricas Rápidas -->
							<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px;">
								<div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; display: flex; align-items: center; gap: 12px;">
									<div style="width: 36px; height: 36px; border-radius: 8px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">👥</div>
									<div>
										<span style="display: block; font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Ativos</span>
										<span id="statTotalEquipe" style="display: block; font-size: 1.25rem; font-weight: 700; color: var(--text-main);">0</span>
									</div>
								</div>
								<div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; display: flex; align-items: center; gap: 12px;">
									<div style="width: 36px; height: 36px; border-radius: 8px; background: #dcfce7; color: #22c55e; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">💰</div>
									<div>
										<span style="display: block; font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Apurado</span>
										<span id="statTotalComissoes" style="display: block; font-size: 1.25rem; font-weight: 700; color: var(--text-main);">R$ 0,00</span>
									</div>
								</div>
							</div>

							<!-- Form Novo Membro da Equipe -->
							<div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 24px;">
								<h3 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
									<span>➕ Cadastrar Profissional</span>
								</h3>
								<form id="formNovoMembro" class="form">
									<div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
										<div class="form-group" style="margin-bottom: 0;">
											<label for="membroNome" style="font-size: 0.85rem;">Nome *</label>
											<input type="text" id="membroNome" required placeholder="Ex: Danilo" style="padding: 6px 10px; font-size: 0.9rem;" />
										</div>
										<div class="form-group" style="margin-bottom: 0;">
											<label for="membroCargo" style="font-size: 0.85rem;">Cargo</label>
											<input type="text" id="membroCargo" placeholder="Ex: Lavador" style="padding: 6px 10px; font-size: 0.9rem;" />
										</div>
										<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
											<div class="form-group" style="margin-bottom: 0;">
												<label for="membroTipoComissao" style="font-size: 0.85rem;">Tipo</label>
												<select id="membroTipoComissao" style="padding: 6px 10px; font-size: 0.9rem;">
													<option value="percentual">Porcentagem (%)</option>
													<option value="fixo">Fixo (R$)</option>
												</select>
											</div>
											<div class="form-group" style="margin-bottom: 0;">
												<label for="membroValorComissao" style="font-size: 0.85rem;">Valor *</label>
												<input type="number" id="membroValorComissao" step="0.5" min="0" required placeholder="0.0" style="padding: 6px 10px; font-size: 0.9rem;" />
											</div>
										</div>
										<button type="submit" class="btn btn-primary" style="margin-top: 8px; width: 100%;">💾 Cadastrar</button>
									</div>
								</form>
							</div>

							<!-- Relatório de Produtividade e Comissões -->
							<div style="border-top: 1px solid var(--border-color); padding-top: 20px;">
								<h3 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 12px;">Apuração de Comissões</h3>
								<div style="display:flex; flex-wrap: wrap; gap:8px; align-items:center; margin-bottom: 16px;">
									<input type="date" id="filtroComissaoInicio" style="padding:4px 8px; font-size:0.85rem; border:1px solid var(--border-color); border-radius:4px;" />
									<span style="font-size:0.85rem; color:var(--text-muted);">até</span>
									<input type="date" id="filtroComissaoFim" style="padding:4px 8px; font-size:0.85rem; border:1px solid var(--border-color); border-radius:4px;" />
									<button type="button" class="btn btn-secondary btn-sm" onclick="filtrarComissoes()">Filtrar</button>
								</div>
								
								<div class="table-responsive" style="margin-top: 10px; overflow-x: auto; -webkit-overflow-scrolling: touch; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
									<!-- Retirado min-width: 800px; e white-space: nowrap para permitir que a tabela esprema -->
									<table class="tabela" style="width: 100%; font-size: 0.85rem; border: none;">
										<thead>
											<tr>
												<th>Profissional</th>
												<th>Regra</th>
												<th>Faturamento</th>
												<th>A Pagar</th>
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
					</div>
				</div>
			</div>
		</main>`;

html = html.replace(regexToReplace, newContent);
fs.writeFileSync('configuracoes.html', html);
