const fs = require('fs');

const scripts = `
		<script src="js/equipe-service.js"></script>
		<script>
			function filtrarComissoes() {
				const inicio = document.getElementById('filtroComissaoInicio');
				const fim = document.getElementById('filtroComissaoFim');
				if (!inicio || !fim) return;
				const relatorio = EquipeService.calcularComissoesPorPeriodo(inicio.value, fim.value);
				const corpo = document.getElementById('corpoTabelaComissoes');
				if (!corpo) return;
				const statEquipe = document.getElementById('statTotalEquipe');
				if (statEquipe) statEquipe.textContent = relatorio.length;
				let totalGeralComissoes = 0;
				relatorio.forEach(r => totalGeralComissoes += r.totalComissao);
				const statComissoes = document.getElementById('statTotalComissoes');
				if (statComissoes) statComissoes.textContent = \`R$ \${totalGeralComissoes.toFixed(2)}\`;
				corpo.innerHTML = '';
				if (relatorio.length === 0) {
					corpo.innerHTML = '<tr><td colspan="7" class="empty-table-message">Nenhum membro cadastrado na equipe.</td></tr>';
					return;
				}
				relatorio.forEach(r => {
					const m = r.membro;
					const regraFmt = m.tipoComissao === 'percentual' ? \`\${m.valorComissao}%\` : \`R$ \${parseFloat(m.valorComissao).toFixed(2)} fixo\`;
					const tr = document.createElement('tr');
					tr.innerHTML = \`
						<td><strong>\${m.nome}</strong></td>
						<td>\${m.cargo || '-'}</td>
						<td><span class="badge" style="background:#f1f5f9; color:#334155;">\${regraFmt}</span></td>
						<td><strong>\${r.qtdServicos}</strong> carros atendidos</td>
						<td>R$ \${r.totalFaturado.toFixed(2)}</td>
						<td><span class="badge-price" style="background:#dcfce7; color:#15803d; font-size:0.95rem;">R$ \${r.totalComissao.toFixed(2)}</span></td>
						<td style="text-align:center;">
							<button type="button" class="btn btn-sm" style="background:transparent; border:1px solid #ef4444; color:#ef4444; padding:3px 8px;" onclick="removerMembroEquipe('\${m.id}')">🗑️</button>
						</td>
					\`;
					corpo.appendChild(tr);
				});
			}
			window.removerMembroEquipe = function(id) {
				EquipeService.removerMembro(id);
				filtrarComissoes();
			};
			
			// Setup only once when DOM loads
			document.addEventListener('DOMContentLoaded', () => {
				const formMembro = document.getElementById('formNovoMembro');
				if (formMembro) {
					formMembro.addEventListener('submit', (e) => {
						e.preventDefault();
						const nome = document.getElementById('membroNome').value.trim();
						const cargo = document.getElementById('membroCargo').value.trim();
						const tipoComissao = document.getElementById('membroTipoComissao').value;
						const valorComissao = parseFloat(document.getElementById('membroValorComissao').value || 0);
						EquipeService.adicionarMembro({ nome, cargo, tipoComissao, valorComissao });
						document.getElementById('formNovoMembro').reset();
						filtrarComissoes();
					});
				}
			});
		</script>
`;

let html = fs.readFileSync('configuracoes.html', 'utf8');
html = html.replace('</body>', scripts + '\n\t</body>');
fs.writeFileSync('configuracoes.html', html);
