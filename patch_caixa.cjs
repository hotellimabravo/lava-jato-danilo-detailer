const fs = require('fs');
let html = fs.readFileSync('configuracoes.html', 'utf8');
html = html.replace('<script src="js/equipe-service.js"></script>', '<script src="js/caixa-service.js"></script>\n\t\t<script src="js/equipe-service.js"></script>');
fs.writeFileSync('configuracoes.html', html);
