// ==========================================================================
// EmpresaService: Gerenciamento Multi-Tenant de Empresas (Exclusivo Master)
// ==========================================================================
import { db, doc, setDoc, getDoc, getDocs, collection, deleteDoc } from './firebase-init.js';
import AuthService from './auth-service.js';

const EMPRESA_PADRAO = {
    id: 'empresa_danilo',
    nome: 'Lava Jato Danilo Detailer',
    tipoNegocio: 'lava_jato',
    icone: '🚗',
    adminUsername: 'admin',
    adminNome: 'Danilo Master',
    telefone: '',
    status: 'ativo',
    criadoEm: '2026-09-01T12:00:00.000Z'
};

const ICONS_MAP = {
    'lava_jato': '🚗',
    'barbearia': '💈',
    'assistencia': '📱',
    'mecanica': '🔧',
    'petshop': '🐾',
    'geral': '🛠️'
};

const EmpresaService = {
    STORAGE_KEY: 'empresas_cadastradas',

    getEmpresas() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            let list = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(list) || list.length === 0) {
                list = [EMPRESA_PADRAO];
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
            }
            return list;
        } catch (e) {
            return [EMPRESA_PADRAO];
        }
    },

    saveEmpresasLocais(list) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    },

    getEmpresaAtiva() {
        const user = AuthService.getCurrentUser();
        const activeId = user?.empresaId || localStorage.getItem('master_active_empresaId') || 'empresa_danilo';
        const list = this.getEmpresas();
        const found = list.find(e => e.id === activeId);
        return found || list[0] || EMPRESA_PADRAO;
    },

    async init() {
        // 1. Tentar sincronizar lista de empresas do Firestore
        try {
            if (db) {
                const colRef = collection(db, 'empresas_lista');
                const snapshot = await getDocs(colRef);
                if (!snapshot.empty) {
                    const cloudList = [];
                    snapshot.forEach(docSnap => {
                        cloudList.push(docSnap.data());
                    });
                    if (cloudList.length > 0) {
                        this.saveEmpresasLocais(cloudList);
                    }
                } else {
                    // Seed inicial da empresa do Danilo no Firestore
                    await setDoc(doc(db, 'empresas_lista', EMPRESA_PADRAO.id), EMPRESA_PADRAO);
                }
            }
        } catch (err) {
            console.warn('Não foi possível sincronizar empresas da nuvem:', err);
        }

        // 2. Renderizar barra do Master se for administrador Master
        this.renderMasterTenantBar();
    },

    renderMasterTenantBar() {
        const user = AuthService.getCurrentUser();
        if (!user || !user.isMaster) {
            const existing = document.getElementById('masterTenantBar');
            if (existing) existing.remove();
            return;
        }

        // Se o Master ainda não tiver empresaId definida ou for 'empresa_master', atribui a ativa
        const activeEmpresa = this.getEmpresaAtiva();
        if (!user.empresaId || user.empresaId === 'empresa_master') {
            user.empresaId = activeEmpresa.id;
            localStorage.setItem('logged_in_user', JSON.stringify(user));
        }

        // Injeta o seletor no header se não existir
        let bar = document.getElementById('masterTenantBar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'masterTenantBar';
            bar.className = 'master-tenant-bar';

            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
                headerActions.parentNode.insertBefore(bar, headerActions);
            }
        }

        const empresas = this.getEmpresas();
        let optionsHtml = empresas.map(emp => {
            const selected = emp.id === activeEmpresa.id ? 'selected' : '';
            return `<option value="${emp.id}" ${selected}>${emp.icone || '🏢'} ${emp.nome}</option>`;
        }).join('');

        bar.innerHTML = `
            <div class="master-tenant-badge" title="Você está logado como Administrador Master do SaaS">
                <span class="master-crown">👑 MASTER</span>
                <span class="tenant-label">Empresa Ativa:</span>
                <select id="selectEmpresaAtivaMaster" class="master-select-tenant" onchange="EmpresaService.trocarEmpresaMaster(this.value)">
                    ${optionsHtml}
                </select>
                <a href="configuracoes.html#empresas" class="btn-manage-tenants" title="Gerenciar e Cadastrar Novas Empresas">
                    ➕ Gerenciar
                </a>
            </div>
        `;
    },

    trocarEmpresaMaster(empresaId) {
        const user = AuthService.getCurrentUser();
        if (!user || !user.isMaster) {
            alert('Apenas o Administrador Master pode alternar entre empresas.');
            return;
        }

        const empresas = this.getEmpresas();
        const target = empresas.find(e => e.id === empresaId);
        if (!target) return;

        // Atualiza empresa no usuário logado
        user.empresaId = target.id;
        localStorage.setItem('logged_in_user', JSON.stringify(user));
        localStorage.setItem('master_active_empresaId', target.id);

        // Limpa coleções temporárias para recarregar da nova empresa sem resquícios
        const COLS = [
            'clientes', 'servicos', 'pedidos', 'caixas_fechados', 'caixa_atual',
            'config_negocio', 'agendamentos', 'estoque_produtos', 'equipe_membros', 
            'fidelidade_config', 'vistorias_pedidos', 'usuarios'
        ];
        COLS.forEach(key => localStorage.removeItem(key));

        // Recarrega a página para iniciar o FirebaseSync na nova empresa
        window.location.reload();
    },

    async criarEmpresa({ nome, tipoNegocio, adminNome, adminUsername, adminPassword, telefone }) {
        const user = AuthService.getCurrentUser();
        if (!user || !user.isMaster) {
            throw new Error('Apenas o Administrador Master tem permissão para cadastrar novas empresas.');
        }

        if (!nome || !nome.trim()) throw new Error('O nome do estabelecimento é obrigatório.');
        if (!adminUsername || !adminUsername.trim()) throw new Error('O usuário de acesso é obrigatório.');
        if (!adminPassword || adminPassword.length < 4) throw new Error('A senha deve ter pelo menos 4 caracteres.');

        const cleanUsername = adminUsername.trim().toLowerCase();
        if (cleanUsername === 'admin') {
            throw new Error('O usuário "admin" é reservado para o Master.');
        }

        // Gera ID único da empresa
        const cleanSlug = nome.trim().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .substring(0, 20);
        const empresaId = `empresa_${cleanSlug}_${Date.now().toString().slice(-4)}`;
        const icone = ICONS_MAP[tipoNegocio] || '🛠️';

        const novaEmpresa = {
            id: empresaId,
            nome: nome.trim(),
            tipoNegocio: tipoNegocio || 'geral',
            icone: icone,
            adminUsername: cleanUsername,
            adminNome: adminNome.trim() || 'Administrador',
            telefone: telefone || '',
            status: 'ativo',
            criadoEm: new Date().toISOString()
        };

        // 1. Salvar no Firestore a Empresa
        if (db) {
            await setDoc(doc(db, 'empresas_lista', empresaId), novaEmpresa);

            // 2. Configuração inicial da empresa
            const configNegocio = {
                nomeEstabelecimento: nome.trim(),
                razaoSocial: nome.trim(),
                tipoNegocio: tipoNegocio || 'geral',
                telefone: telefone || '',
                iconeCustom: icone
            };
            await setDoc(doc(db, 'empresas', empresaId, 'dados', 'config_negocio'), {
                data: JSON.stringify(configNegocio)
            });

            // 3. Criar usuário Administrador vinculado a esta empresa
            const hash = await AuthService.hashPassword(adminPassword);
            const userRecord = {
                nome: adminNome.trim() || 'Administrador',
                username: cleanUsername,
                passwordHash: hash,
                empresaId: empresaId,
                isMaster: false,
                permissoes: ['agenda', 'pedidos', 'caixa', 'estoque', 'posvenda', 'clientes', 'servicos', 'configuracoes']
            };
            await setDoc(doc(db, 'users', cleanUsername), userRecord);

            // Também salvar no subdocumento de usuários da própria empresa
            const usersData = [{
                id: Date.now().toString(),
                nome: adminNome.trim() || 'Administrador',
                username: cleanUsername,
                passwordHash: hash,
                permissoes: userRecord.permissoes
            }];
            await setDoc(doc(db, 'empresas', empresaId, 'dados', 'usuarios'), {
                data: JSON.stringify(usersData)
            });
        }

        // 4. Salvar localmente
        const list = this.getEmpresas();
        list.push(novaEmpresa);
        this.saveEmpresasLocais(list);

        return novaEmpresa;
    },

    async excluirEmpresa(empresaId) {
        const user = AuthService.getCurrentUser();
        if (!user || !user.isMaster) {
            throw new Error('Apenas o Administrador Master pode excluir empresas.');
        }

        if (empresaId === 'empresa_danilo') {
            throw new Error('A empresa padrão Danilo Detailer não pode ser excluída.');
        }

        // Se for a empresa ativa, volta para a padrão antes
        if (user.empresaId === empresaId) {
            this.trocarEmpresaMaster('empresa_danilo');
            return;
        }

        // Deletar da nuvem
        if (db) {
            try {
                await deleteDoc(doc(db, 'empresas_lista', empresaId));
            } catch (err) {
                console.warn('Erro ao excluir empresa da nuvem:', err);
            }
        }

        // Deletar local
        let list = this.getEmpresas();
        list = list.filter(e => e.id !== empresaId);
        this.saveEmpresasLocais(list);
    }
};

window.EmpresaService = EmpresaService;

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    EmpresaService.init();
});

export default EmpresaService;
export { EmpresaService };
