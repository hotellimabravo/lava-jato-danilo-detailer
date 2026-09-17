const fs = require('fs');
let html = fs.readFileSync('configuracoes.html', 'utf8');

html = html.replace(
`<span class="badge badge-warning" style="margin-left: auto; font-size: 0.65rem; padding: 2px 6px;">Em breve</span>`,
``
);

fs.writeFileSync('configuracoes.html', html);
