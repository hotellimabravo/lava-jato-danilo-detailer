import { db, doc, setDoc, onSnapshot } from './firebase-init.js';

const COLLECTIONS = [
    'clientes', 'servicos', 'pedidos', 'caixas_fechados', 'caixa_atual',
    'config_negocio', 'agendamentos', 'estoque_produtos', 'equipe_membros', 
    'fidelidade_config', 'vistorias_pedidos', 'usuarios'
];

let isSyncing = false;
let syncEnabled = false;

const originalSetItem = localStorage.setItem.bind(localStorage);

localStorage.setItem = function(key, value) {
    originalSetItem(key, value);
    if (syncEnabled && !isSyncing && COLLECTIONS.includes(key)) {
        const user = window.AuthService ? window.AuthService.getCurrentUser() : null;
        if (user && user.empresaId && db) {
            // Push to Firestore
            try {
                const docRef = doc(db, 'empresas', user.empresaId, 'dados', key);
                setDoc(docRef, { data: value }).catch(err => console.warn('Erro ao sincronizar com nuvem:', err ? (err.message || String(err)) : ''));
            } catch (err) {
                console.warn('Erro no setDoc:', err ? (err.message || String(err)) : '');
            }
        }
    }
};

const FirebaseSync = {
    start: function() {
        const user = window.AuthService ? window.AuthService.getCurrentUser() : null;
        if (!user || !user.empresaId || !db) return;

        syncEnabled = true;

        COLLECTIONS.forEach(key => {
            try {
                const docRef = doc(db, 'empresas', user.empresaId, 'dados', key);
                onSnapshot(docRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const cloudData = snapshot.data().data;
                        const localData = localStorage.getItem(key);
                        if (cloudData !== localData) {
                            isSyncing = true;
                            originalSetItem(key, cloudData);
                            isSyncing = false;
                            
                            // Notify UI components
                            window.dispatchEvent(new CustomEvent('cloudDataChanged', { detail: key }));
                        }
                    } else {
                        // Seed initial data if local storage has it
                        const localData = localStorage.getItem(key);
                        if (localData && localData !== '[]' && localData !== '{}' && localData.trim() !== '') {
                            setDoc(docRef, { data: localData }).catch(() => {});
                        }
                    }
                }, (error) => {
                    console.warn(`Aviso de conexão para ${key}:`, error ? (error.message || String(error)) : '');
                });
            } catch (err) {
                console.warn(`Erro ao iniciar listener para ${key}:`, err ? (err.message || String(err)) : '');
            }
        });
    },
    stop: function() {
        syncEnabled = false;
    }
};

window.FirebaseSync = FirebaseSync;

// Auto-refresh UI when cloud data changes
window.addEventListener('cloudDataChanged', (e) => {
    const key = e.detail;
    if (key === 'clientes' && typeof window.renderizarTabelaClientes === 'function') window.renderizarTabelaClientes();
    if (key === 'servicos' && typeof window.renderizarTabelaServicos === 'function') window.renderizarTabelaServicos();
    if (key === 'pedidos' && typeof window.renderizarTabelaPedidos === 'function') window.renderizarTabelaPedidos();
    if (key === 'caixas_fechados' && typeof window.renderizarTabelaCaixa === 'function') window.renderizarTabelaCaixa();
    if (key === 'agendamentos' && typeof window.renderizarAgenda === 'function') window.renderizarAgenda();
    if (key === 'equipe_membros' && typeof window.renderizarEquipe === 'function') window.renderizarEquipe();
    if (key === 'estoque_produtos' && typeof window.renderizarEstoque === 'function') window.renderizarEstoque();
    if (key === 'usuarios' && typeof window.renderizarUsuarios === 'function') window.renderizarUsuarios();
});

export default FirebaseSync;
export { FirebaseSync };
