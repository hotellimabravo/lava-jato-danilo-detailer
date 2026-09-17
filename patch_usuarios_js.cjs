const fs = require('fs');
let html = fs.readFileSync('configuracoes.html', 'utf8');

const jsLogic = `
			// ==========================================
			// Lógica de Usuários
			// ==========================================
			function renderizarUsuarios() {
				const users = AuthService.getUsers();
				const corpo = document.getElementById('corpoTabelaUsuarios');
				if (!corpo) return;

				corpo.innerHTML = '';
				
				// Add Master explicitly so it can be seen
				corpo.innerHTML += \`
					<tr>
						<td><strong>Administrador Master</strong></td>
						<td>admin</td>
						<td><span class="badge" style="background:#1e40af; color:#fff;">Acesso Total</span></td>
						<td style="text-align:center;">-</td>
					</tr>
				\`;

				users.forEach(u => {
					const count = u.permissoes ? u.permissoes.length : 0;
					const btnEdit = \`<button type="button" class="btn btn-sm" style="background:transparent; border:1px solid #3b82f6; color:#3b82f6; padding:3px 8px; margin-right:4px;" onclick="editarUsuario('\${u.id}')">✏️</button>\`;
					const btnDel = \`<button type="button" class="btn btn-sm" style="background:transparent; border:1px solid #ef4444; color:#ef4444; padding:3px 8px;" onclick="removerUsuario('\${u.id}')">🗑️</button>\`;
					
					corpo.innerHTML += \`
						<tr>
							<td><strong>\${u.nome}</strong></td>
							<td>\${u.username}</td>
							<td>\${count} módulos permitidos</td>
							<td style="text-align:center; white-space:nowrap;">\${btnEdit} \${btnDel}</td>
						</tr>
					\`;
				});
			}

			function limparFormUsuario() {
				document.getElementById('formUsuario').reset();
				document.getElementById('userId').value = '';
				document.getElementById('tituloFormUser').textContent = '➕ Adicionar Novo Usuário';
				document.getElementById('userPassword').required = true;
				document.getElementById('labelSenhaDica').textContent = '*';
				document.getElementById('btnCancelarEdicaoUser').style.display = 'none';
			}

			window.editarUsuario = function(id) {
				const users = AuthService.getUsers();
				const user = users.find(u => u.id === id);
				if (!user) return;

				document.getElementById('userId').value = user.id;
				document.getElementById('userNome').value = user.nome;
				document.getElementById('userUsername').value = user.username;
				document.getElementById('userPassword').value = '';
				document.getElementById('userPassword').required = false;
				document.getElementById('labelSenhaDica').textContent = '(Deixe em branco para não alterar)';
				
				document.getElementById('tituloFormUser').textContent = '✏️ Editar Usuário';
				document.getElementById('btnCancelarEdicaoUser').style.display = 'inline-block';

				const checkboxes = document.querySelectorAll('input[name="permissoes"]');
				checkboxes.forEach(cb => {
					cb.checked = user.permissoes && user.permissoes.includes(cb.value);
				});
				
				alternarAbaConfig('usuarios');
			};

			window.removerUsuario = function(id) {
				if (confirm('Tem certeza que deseja remover este usuário?')) {
					AuthService.removerUser(id);
					renderizarUsuarios();
				}
			};

			document.addEventListener('DOMContentLoaded', () => {
				const formUser = document.getElementById('formUsuario');
				if (formUser) {
					formUser.addEventListener('submit', async (e) => {
						e.preventDefault();
						const id = document.getElementById('userId').value;
						const nome = document.getElementById('userNome').value.trim();
						const username = document.getElementById('userUsername').value.trim();
						const pass = document.getElementById('userPassword').value;
						
						const checkboxes = document.querySelectorAll('input[name="permissoes"]:checked');
						const permissoes = Array.from(checkboxes).map(cb => cb.value);

						try {
							if (id) {
								await AuthService.updateUser(id, nome, username, pass, permissoes);
								alert('Usuário atualizado com sucesso!');
							} else {
								await AuthService.addUser(nome, username, pass, permissoes);
								alert('Usuário cadastrado com sucesso!');
							}
							limparFormUsuario();
							renderizarUsuarios();
						} catch (err) {
							alert(err.message);
						}
					});
				}
				
				renderizarUsuarios();
			});
`;

html = html.replace(
`			document.addEventListener('DOMContentLoaded', () => {
				const formMembro = document.getElementById('formNovoMembro');`,
jsLogic + `\n			document.addEventListener('DOMContentLoaded', () => {
				const formMembro = document.getElementById('formNovoMembro');`
);

fs.writeFileSync('configuracoes.html', html);
