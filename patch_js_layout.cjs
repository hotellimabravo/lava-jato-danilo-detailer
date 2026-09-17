const fs = require('fs');
let html = fs.readFileSync('configuracoes.html', 'utf8');

// The JS render function needs to match the new 5 column table
// Replace the old tr.innerHTML = ...
html = html.replace(
`					const tr = document.createElement('tr');
					tr.innerHTML = \`
						<td style="white-space: nowrap;"><strong>\${m.nome}</strong></td>
						<td style="white-space: nowrap;">\${m.cargo || '-'}</td>
						<td style="white-space: nowrap;"><span class="badge" style="background:#f1f5f9; color:#334155;">\${regraFmt}</span></td>
						<td style="white-space: nowrap;"><strong>\${r.qtdServicos}</strong> carros</td>
						<td style="white-space: nowrap;">R$ \${r.totalFaturado.toFixed(2)}</td>
						<td style="white-space: nowrap;"><span class="badge-price" style="background:#dcfce7; color:#15803d; font-size:0.95rem;">R$ \${r.totalComissao.toFixed(2)}</span></td>
						<td style="text-align:center;">
							<button type="button" class="btn btn-sm" style="background:transparent; border:1px solid #ef4444; color:#ef4444; padding:3px 8px;" onclick="removerMembroEquipe('\${m.id}')">🗑️</button>
						</td>
					\`;`,
`					const tr = document.createElement('tr');
					tr.innerHTML = \`
						<td>
							<strong>\${m.nome}</strong>
							<div style="font-size: 0.7rem; color: var(--text-muted);">\${m.cargo || 'Equipe'} - \${r.qtdServicos} carros</div>
						</td>
						<td><span class="badge" style="background:#f1f5f9; color:#334155;">\${regraFmt}</span></td>
						<td>R$ \${r.totalFaturado.toFixed(2)}</td>
						<td><span class="badge-price" style="background:#dcfce7; color:#15803d; font-size:0.85rem;">R$ \${r.totalComissao.toFixed(2)}</span></td>
						<td style="text-align:center;">
							<button type="button" class="btn btn-sm" style="background:transparent; border:1px solid #ef4444; color:#ef4444; padding:3px 8px;" onclick="removerMembroEquipe('\${m.id}')">🗑️</button>
						</td>
					\`;`
);

// also fix the empty table message colspan
html = html.replace(
`corpo.innerHTML = '<tr><td colspan="7" class="empty-table-message">Nenhum membro cadastrado na equipe.</td></tr>';`,
`corpo.innerHTML = '<tr><td colspan="5" class="empty-table-message">Nenhum membro cadastrado na equipe.</td></tr>';`
);

fs.writeFileSync('configuracoes.html', html);
