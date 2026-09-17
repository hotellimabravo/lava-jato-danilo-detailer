// ==========================================================================
// Serviço de Autenticação e Autorização (Controle de Usuários)
// ==========================================================================
const AuthService = {
    MASTER_USER: 'admin',
    MASTER_HASH: 'cf3ba79fe53bf2417903fbde744a088e4e0ca0ca877ee76dcd174011ce5a43dd',

    async hashPassword(password) {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    getUsers() {
        return JSON.parse(localStorage.getItem('usuarios')) || [];
    },

    saveUsers(users) {
        localStorage.setItem('usuarios', JSON.stringify(users));
    },

    async addUser(nome, username, password, permissoes) {
        const users = this.getUsers();
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            throw new Error('Nome de usuário já existe');
        }
        const hash = await this.hashPassword(password);
        users.push({
            id: Date.now().toString(),
            nome,
            username,
            passwordHash: hash,
            permissoes: permissoes
        });
        this.saveUsers(users);
    },

    async updateUser(id, nome, username, password, permissoes) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) throw new Error('Usuário não encontrado');
        
        if (users.find(u => u.id !== id && u.username.toLowerCase() === username.toLowerCase())) {
            throw new Error('Nome de usuário já existe');
        }

        users[index].nome = nome;
        users[index].username = username;
        users[index].permissoes = permissoes;
        if (password && password.trim() !== '') {
            users[index].passwordHash = await this.hashPassword(password);
        }
        this.saveUsers(users);
    },

    removerUser(id) {
        let users = this.getUsers();
        users = users.filter(u => u.id !== id);
        this.saveUsers(users);
    },

    async login(username, password) {
        const usernameNormalized = username.trim().toLowerCase();
        const hash = await this.hashPassword(password);

        if (usernameNormalized === this.MASTER_USER.toLowerCase() && hash === this.MASTER_HASH) {
            const masterData = { id: 'master', nome: 'Administrador Master', username: 'admin', isMaster: true };
            localStorage.setItem('logged_in_user', JSON.stringify(masterData));
            return true;
        }

        const users = this.getUsers();
        const user = users.find(u => u.username.toLowerCase() === usernameNormalized && u.passwordHash === hash);
        
        if (user) {
            const { passwordHash, ...userData } = user;
            localStorage.setItem('logged_in_user', JSON.stringify(userData));
            return true;
        }

        return false;
    },

    logout() {
        localStorage.removeItem('logged_in_user');
        window.location.href = 'login.html';
    },

    getCurrentUser() {
        const data = localStorage.getItem('logged_in_user');
        return data ? JSON.parse(data) : null;
    },

    checkAuth() {
        const user = this.getCurrentUser();
        const isLoginPage = window.location.pathname.endsWith('login.html');
        
        if (!user && !isLoginPage) {
            window.location.href = 'login.html';
            return;
        }
        
        if (user && isLoginPage) {
            window.location.href = 'index.html';
            return;
        }

        if (user && !user.isMaster && !isLoginPage) {
            this.applyPermissions(user);
        }
    },

    hasPermission(moduleName) {
        const user = this.getCurrentUser();
        if (!user) return false;
        if (user.isMaster) return true;
        return user.permissoes && user.permissoes.includes(moduleName);
    },

    applyPermissions(user) {
        const path = window.location.pathname;
        let currentModule = '';
        if (path.includes('agendamentos.html')) currentModule = 'agenda';
        if (path.includes('pedidos.html')) currentModule = 'pedidos';
        if (path.includes('caixa.html')) currentModule = 'caixa';
        if (path.includes('estoque.html')) currentModule = 'estoque';
        if (path.includes('fidelidade.html')) currentModule = 'posvenda';
        if (path.includes('clientes.html')) currentModule = 'clientes';
        if (path.includes('servicos.html')) currentModule = 'servicos';
        if (path.includes('configuracoes.html')) currentModule = 'configuracoes';

        // Redireciona se não tiver permissão
        if (currentModule && !this.hasPermission(currentModule)) {
            alert('Seu usuário não tem permissão para acessar esta área.');
            window.location.href = 'index.html';
        }

        // Esconder itens do menu
        document.addEventListener('DOMContentLoaded', () => {
            const navMap = {
                'agenda': 'a[href="agendamentos.html"]',
                'pedidos': 'a[href="pedidos.html"]',
                'caixa': 'a[href="caixa.html"]',
                'estoque': 'a[href="estoque.html"]',
                'posvenda': 'a[href="fidelidade.html"]',
                'clientes': 'a[href="clientes.html"]',
                'servicos': 'a[href="servicos.html"]',
                'configuracoes': '.btn-settings-gear'
            };

            for (const [module, selector] of Object.entries(navMap)) {
                if (!this.hasPermission(module)) {
                    const el = document.querySelector(selector);
                    if (el) el.style.display = 'none';
                }
            }
        });
    }
};

AuthService.checkAuth();
