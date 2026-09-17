const fs = require('fs');

const uiContent = `
					<div id="abaConteudoUsuarios" style="display: none;">
						<div class="settings-section-card">
							<div class="settings-section-header">
								<h2 class="settings-section-title">
									<span>👥 Controle de Acesso e Usuários</span>
								</h2>
							</div>
							
							<!-- Form Cadastro/Edição de Usuário -->
							<div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 24px;">
								<h3 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
									<span id="tituloFormUser">➕ Adicionar Novo Usuário</span>
								</h3>
								<form id="formUsuario" class="form">
									<input type="hidden" id="userId" />
									<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; align-items: end;">
										<div class="form-group" style="margin-bottom: 0;">
											<label for="userNome" style="font-size: 0.85rem;">Nome Completo *</label>
											<input type="text" id="userNome" required placeholder="Ex: João Silva" style="padding: 6px 10px; font-size: 0.9rem;" />
										</div>
										<div class="form-group" style="margin-bottom: 0;">
											<label for="userUsername" style="font-size: 0.85rem;">Nome de Usuário (Login) *</label>
											<input type="text" id="userUsername" required placeholder="Ex: joao" style="padding: 6px 10px; font-size: 0.9rem;" />
										</div>
										<div class="form-group" style="margin-bottom: 0;">
											<label for="userPassword" style="font-size: 0.85rem;">Senha <span id="labelSenhaDica"></span></label>
											<input type="password" id="userPassword" placeholder="***" style="padding: 6px 10px; font-size: 0.9rem;" />
										</div>
									</div>

									<div style="margin-top: 16px; border-top: 1px dashed var(--border-color); padding-top: 12px;">
										<label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 8px;">Permissões de Acesso (Marque o que ele pode acessar):</label>
										<div style="display: flex; flex-wrap: wrap; gap: 12px;">
											<label style="font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
												<input type="checkbox" name="permissoes" value="agenda" checked> Agenda
											</label>
											<label style="font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
												<input type="checkbox" name="permissoes" value="pedidos" checked> Pedidos (O.S.)
											</label>
											<label style="font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
												<input type="checkbox" name="permissoes" value="caixa"> Caixa
											</label>
											<label style="font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
												<input type="checkbox" name="permissoes" value="estoque"> Estoque
											</label>
											<label style="font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
												<input type="checkbox" name="permissoes" value="posvenda"> Pós-Venda
											</label>
											<label style="font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
												<input type="checkbox" name="permissoes" value="clientes" checked> Clientes
											</label>
											<label style="font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
												<input type="checkbox" name="permissoes" value="servicos"> Serviços
											</label>
											<label style="font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
												<input type="checkbox" name="permissoes" value="configuracoes"> Configurações
											</label>
										</div>
									</div>

									<div style="display: flex; gap: 8px; margin-top: 16px;">
										<button type="submit" class="btn btn-primary" style="flex: 1;">💾 Salvar Usuário</button>
										<button type="button" class="btn btn-secondary" id="btnCancelarEdicaoUser" style="display: none;" onclick="limparFormUsuario()">Cancelar</button>
									</div>
								</form>
							</div>

							<!-- Lista de Usuários -->
							<div class="table-responsive" style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); overflow-x: auto;">
								<table class="tabela" style="width: 100%; font-size: 0.85rem;">
									<thead>
										<tr>
											<th>Nome</th>
											<th>Usuário</th>
											<th>Acessos Permitidos</th>
											<th style="text-align:center;">Ações</th>
										</tr>
									</thead>
									<tbody id="corpoTabelaUsuarios">
										<!-- Preenchido via JS -->
									</tbody>
								</table>
							</div>
						</div>
					</div>
`;

let html = fs.readFileSync('configuracoes.html', 'utf8');

const regex = /<div id="abaConteudoUsuarios" style="display: none;">[\s\S]*?<\/div>\s*<\/div>\s*<!-- ==================================================== -->\s*<!-- ABA: EQUIPE/m;
const regexAba = /<div id="abaConteudoUsuarios" style="display: none;">[\s\S]*?(?=<!-- ==================================================== -->\s*<!-- ABA: EQUIPE)/;

html = html.replace(regexAba, uiContent);
fs.writeFileSync('configuracoes.html', html);
