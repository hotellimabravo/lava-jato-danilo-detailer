import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;


app.get(['/firebase-config.json', '/firebase-applet-config.json'], (req, res) => {
    res.sendFile(path.join(__dirname, 'firebase-applet-config.json'));
});

// PWA Headers for Service Worker and Web App Manifest
app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(__dirname, 'sw.js'));
});

app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(path.join(__dirname, 'manifest.json'));
});

// Explicitly serve /js folder
app.use('/js', express.static(path.join(__dirname, 'js')));

// Serve static assets from root directory
app.use(express.static(__dirname));

// Route handlers for clean URLs (with or without trailing slash)
const pages = [
	'clientes', 'historico', 'pedidos', 'servicos', 'caixa', 
	'configuracoes', 'agendamentos', 'estoque', 'fidelidade', 'login', 'index'
];
pages.forEach((page) => {
	app.get([`/${page}`, `/${page}/`], (req, res) => {
		res.sendFile(path.join(__dirname, `${page}.html`));
	});
});

// Default root route
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

// Prevent 404 HTML responses for script/JSON requests to avoid SyntaxError: Unexpected token '<'
app.use((req, res, next) => {
    if (req.path.endsWith('.js')) {
        return res.status(404).type('application/javascript').send('/* 404: Script not found */');
    }
    if (req.path.endsWith('.json')) {
        return res.status(404).type('application/json').send('{}');
    }
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running at http://0.0.0.0:${PORT}`);
});
