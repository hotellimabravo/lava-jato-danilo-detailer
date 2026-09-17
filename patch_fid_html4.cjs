const fs = require('fs');
let html = fs.readFileSync('fidelidade.html', 'utf8');

html = html.replace(
`			function carregarPainelFidelidade() {
				const listaReativar = FidelidadeService.getClientesParaReativar();`,
`			function carregarPainelFidelidade() {
				const cfg = FidelidadeService.getConfig();
				const listaReativar = FidelidadeService.getClientesParaReativar();`
);

html = html.replace(
`						\`🎁 Seu saldo de fidelidade: \${prog.selosAtuais}/\${prog.metaSelos} selos acumulados!\\n\\n\` +`,
`						\`🎁 Seu saldo de fidelidade: \${prog.selosAtuais}/\${prog.metaSelos} selos acumulados (Premiação: \${cfg.premioDescricao})!\\n\\n\` +`
);

html = html.replace(
`							<small style="color:var(--text-muted);">\${prog.totalLavagens} lavagens no total</small>`,
`							<small style="color:var(--text-muted);">\${prog.totalLavagens} \${cfg.servicoQualificado ? cfg.servicoQualificado : 'serviços'} no total</small>`
);

fs.writeFileSync('fidelidade.html', html);
