const fs = require('fs');
let html = fs.readFileSync('fidelidade.html', 'utf8');

const settingsCard = `
			<!-- Configurações da Fidelidade -->
			<div class="content-card" style="margin-bottom: 24px;">
				<div class="content-card-title" style="display: flex; justify-content: space-between; align-items: center;">
					<span>⚙️ Configurar Regras de Fidelidade</span>
					<button type="button" class="btn btn-sm btn-primary" onclick="salvarConfigFidelidade()">Salvar Regras</button>
				</div>
				<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; padding-top: 8px;">
					<div class="form-group" style="margin-bottom: 0;">
						<label for="cfgMetaSelos" style="font-size: 0.85rem;">A cada quantos serviços?</label>
						<input type="number" id="cfgMetaSelos" min="1" value="10" style="padding: 6px 10px; font-size: 0.9rem;" />
					</div>
					<div class="form-group" style="margin-bottom: 0;">
						<label for="cfgServicoQualificado" style="font-size: 0.85rem;">Serviço Participante (Promoção)</label>
						<select id="cfgServicoQualificado" style="padding: 6px 10px; font-size: 0.9rem;">
							<option value="">Todos os Serviços</option>
							<!-- Options injetadas via JS -->
						</select>
					</div>
					<div class="form-group" style="margin-bottom: 0;">
						<label for="cfgPremioDescricao" style="font-size: 0.85rem;">Ganha qual BRINDE?</label>
						<input type="text" id="cfgPremioDescricao" placeholder="Ex: 1 Brinde Especial, 1 Lavagem..." style="padding: 6px 10px; font-size: 0.9rem;" />
					</div>
				</div>
			</div>
`;

html = html.replace(
`			<!-- Tabela: Clientes para Reativar / Pós Venda -->`,
settingsCard + `\n			<!-- Tabela: Clientes para Reativar / Pós Venda -->`
);

fs.writeFileSync('fidelidade.html', html);
