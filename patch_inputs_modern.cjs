const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

css = css.replace(
`.form input,
.form select,
.form textarea {
	width: 100%;
	padding: 10px 14px;
	font-size: 1rem;
	font-family: inherit;
	color: var(--text-main);
	background-color: #ffffff;
	border: 1px solid var(--border-color);
	border-radius: var(--radius-sm);`,
`.form input,
.form select,
.form textarea {
	width: 100%;
	padding: 12px 16px;
	font-size: 1rem;
	font-family: inherit;
	color: var(--text-main);
	background-color: #f8fafc;
	border: 2px solid #e2e8f0;
	border-radius: 12px;
	transition: all 0.2s ease;
	box-sizing: border-box;`
);

css = css.replace(
`.form input:focus,
.form select:focus,
.form textarea:focus {
	outline: none;
	border-color: var(--border-focus);
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}`,
`.form input:focus,
.form select:focus,
.form textarea:focus {
	outline: none;
	border-color: var(--primary);
	background-color: #ffffff;
	box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}`
);

fs.writeFileSync('style.css', css);
