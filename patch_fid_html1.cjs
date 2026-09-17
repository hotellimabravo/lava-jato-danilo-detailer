const fs = require('fs');
let html = fs.readFileSync('fidelidade.html', 'utf8');

html = html.replace(
`<span class="stat-value" style="font-size:1.25rem;">10 Lavagens = 1 Grátis</span>`,
`<span class="stat-value" id="statRegraFidelidade" style="font-size:1.15rem; line-height: 1.2; margin-top: 4px;">10 serviços = 1 Brinde</span>`
);

fs.writeFileSync('fidelidade.html', html);
