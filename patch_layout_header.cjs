const fs = require('fs');

let html = fs.readFileSync('configuracoes.html', 'utf8');

// Ajustar o titulo da aba para quebrar suavemente
html = html.replace(
`<div class="page-header" style="margin-bottom: 24px;">
							<h1 class="page-title">Equipe & Relatório de Comissões</h1>
							<p class="page-subtitle">Cadastre lavadores e detailers, defina porcentagens de comissão e apure os valores devidos por período</p>
						</div>`,
`<div class="page-header" style="margin-bottom: 24px; padding: 0 4px;">
							<h1 class="page-title" style="font-size: 1.25rem; line-height: 1.3;">Equipe & Relatório de Comissões</h1>
							<p class="page-subtitle" style="font-size: 0.9rem; line-height: 1.5; margin-top: 6px;">Cadastre lavadores, defina comissões e apure os valores devidos por período</p>
						</div>`
);

fs.writeFileSync('configuracoes.html', html);
