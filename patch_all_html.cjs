const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'login.html');

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes('auth-service.js')) {
        content = content.replace('</head>', '\t<script src="js/auth-service.js"></script>\n\t</head>');
    }

    const logoutBtnHTML = `					<button type="button" class="btn-settings-gear" title="Bloquear Sistema (Sair)" onclick="AuthService.logout()" style="background: transparent; border: none; cursor: pointer; color: inherit;">
						🔒
					</button>`;
    
    if (!content.includes('AuthService.logout()')) {
        content = content.replace(/<a href="configuracoes\.html" class="btn-settings-gear[^>]*>[\s\S]*?<\/a>/, match => `${match}\n${logoutBtnHTML}`);
    }

    fs.writeFileSync(file, content);
}
