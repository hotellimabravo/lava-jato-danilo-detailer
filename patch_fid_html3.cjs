const fs = require('fs');
let html = fs.readFileSync('fidelidade.html', 'utf8');

const newScript = `
			function carregarConfigFidelidadeUI() {
				const cfg = FidelidadeService.getConfig();
				document.getElementById('cfgMetaSelos').value = cfg.metaSelos || 10;
				document.getElementById('cfgPremioDescricao').value = cfg.premioDescricao || '';
				
				// Carregar lista de serviços disponíveis
				const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
				const sel = document.getElementById('cfgServicoQualificado');
				sel.innerHTML = '<option value="">Todos os Serviços</option>';
				servicos.forEach(s => {
					const opt = document.createElement('option');
					opt.value = s.nome;
					opt.textContent = s.nome;
					if (cfg.servicoQualificado === s.nome) opt.selected = true;
					sel.appendChild(opt);
				});

				// Atualiza o texto do stat card superior
				const servTexto = cfg.servicoQualificado ? cfg.servicoQualificado : 'serviços';
				document.getElementById('statRegraFidelidade').textContent = \`\${cfg.metaSelos} \${servTexto} = \${cfg.premioDescricao}\`;
			}

			window.salvarConfigFidelidade = function() {
				const cfg = FidelidadeService.getConfig();
				cfg.metaSelos = parseInt(document.getElementById('cfgMetaSelos').value) || 10;
				cfg.servicoQualificado = document.getElementById('cfgServicoQualificado').value;
				cfg.premioDescricao = document.getElementById('cfgPremioDescricao').value || 'Brinde';
				
				FidelidadeService.salvarConfig(cfg);
				carregarConfigFidelidadeUI();
				carregarPainelFidelidade(); // recarrega a tabela de progresso com a nova regra
				alert('Regras de fidelidade atualizadas com sucesso!');
			};
`;

html = html.replace(
`			function carregarPainelFidelidade() {`,
newScript + `\n			function carregarPainelFidelidade() {`
);

html = html.replace(
`			document.addEventListener('DOMContentLoaded', carregarPainelFidelidade);`,
`			document.addEventListener('DOMContentLoaded', () => {
				carregarConfigFidelidadeUI();
				carregarPainelFidelidade();
			});`
);

fs.writeFileSync('fidelidade.html', html);
