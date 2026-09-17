const fs = require('fs');

let html = fs.readFileSync('configuracoes.html', 'utf8');

// Ajustar o renderizador JS da tabela
html = html.replace(
`						<td><strong>\${m.nome}</strong></td>
						<td>\${m.cargo || '-'}</td>
						<td><span class="badge" style="background:#f1f5f9; color:#334155;">\${regraFmt}</span></td>
						<td><strong>\${r.qtdServicos}</strong> carros atendidos</td>
						<td>R$ \${r.totalFaturado.toFixed(2)}</td>
						<td><span class="badge-price" style="background:#dcfce7; color:#15803d; font-size:0.95rem;">R$ \${r.totalComissao.toFixed(2)}</span></td>`,
`						<td style="white-space: nowrap;"><strong>\${m.nome}</strong></td>
						<td style="white-space: nowrap;">\${m.cargo || '-'}</td>
						<td style="white-space: nowrap;"><span class="badge" style="background:#f1f5f9; color:#334155;">\${regraFmt}</span></td>
						<td style="white-space: nowrap;"><strong>\${r.qtdServicos}</strong> carros</td>
						<td style="white-space: nowrap;">R$ \${r.totalFaturado.toFixed(2)}</td>
						<td style="white-space: nowrap;"><span class="badge-price" style="background:#dcfce7; color:#15803d; font-size:0.95rem;">R$ \${r.totalComissao.toFixed(2)}</span></td>`
);

fs.writeFileSync('configuracoes.html', html);
