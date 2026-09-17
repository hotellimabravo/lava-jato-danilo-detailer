const fs = require('fs');

let html = fs.readFileSync('configuracoes.html', 'utf8');
html = html.replace(
`<form id="formNovoMembro" class="form">
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
							</form>`,
							
`<form id="formNovoMembro" class="form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; align-items: end;">
								<div class="form-group" style="margin-bottom: 0;">
									<label for="membroNome">Nome do Profissional *</label>
									<input type="text" id="membroNome" required placeholder="Ex: Danilo, Lucas, Marcos..." />
								</div>
								<div class="form-group" style="margin-bottom: 0;">
									<label for="membroCargo">Função / Cargo</label>
									<input type="text" id="membroCargo" placeholder="Ex: Lavador, Polidor, Detailer" />
								</div>
								<div class="form-group" style="margin-bottom: 0;">
									<label for="membroTipoComissao">Tipo de Comissão</label>
									<select id="membroTipoComissao">
										<option value="percentual">Porcentagem sobre o Serviço (%)</option>
										<option value="fixo">Valor Fixo por Carro (R$)</option>
									</select>
								</div>
								<div class="form-group" style="margin-bottom: 0;">
									<label for="membroValorComissao">Valor / Taxa *</label>
									<input type="number" id="membroValorComissao" step="0.5" min="0" required placeholder="Ex: 30" />
								</div>
								<div class="form-actions" style="margin-top: 0;">
									<button type="submit" class="btn btn-primary" style="width: 100%; white-space: nowrap;">💾 Cadastrar Profissional</button>
								</div>
							</form>`
);

fs.writeFileSync('configuracoes.html', html);
