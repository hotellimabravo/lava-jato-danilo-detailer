const fs = require('fs');

let html = fs.readFileSync('configuracoes.html', 'utf8');

// Ajustar a tabela para nao usar thead tão espremido
html = html.replace(
`<div class="table-responsive">
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
									</thead>`,
`<div class="table-responsive" style="margin-top: 10px; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 8px;">
								<table class="tabela" style="min-width: 800px;">
									<thead>
										<tr>
											<th style="white-space: nowrap;">Profissional</th>
											<th style="white-space: nowrap;">Cargo</th>
											<th style="white-space: nowrap;">Regra Comissão</th>
											<th style="white-space: nowrap;">Serviços Realizados</th>
											<th style="white-space: nowrap;">Faturamento</th>
											<th style="white-space: nowrap;">A Pagar (Comissão)</th>
											<th style="text-align:center; white-space: nowrap;">Ações</th>
										</tr>
									</thead>`
);

fs.writeFileSync('configuracoes.html', html);
