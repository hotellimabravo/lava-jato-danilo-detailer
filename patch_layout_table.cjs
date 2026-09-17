const fs = require('fs');

let html = fs.readFileSync('configuracoes.html', 'utf8');

// Ajustar a quebra do título da tabela
html = html.replace(
`<div class="content-card-title" style="flex-wrap:wrap; gap:10px;">
								<span>Apuração de Comissões & Serviços Executados</span>
								<div style="display:flex; gap:8px; align-items:center;">`,
`<div class="content-card-title" style="flex-direction: column; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
								<span style="font-size: 1.05rem;">Apuração de Comissões & Serviços Executados</span>
								<div style="display:flex; flex-wrap: wrap; gap:8px; align-items:center; width: 100%;">`
);

fs.writeFileSync('configuracoes.html', html);
