import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { LanguageProvider } from './i18n.jsx';
import { UIProvider } from './ui/index.jsx';

// Wrap render in try/catch to capture runtime errors during mount and
// write them to the page and console for easier debugging in dev.
const mount = () => {
	try {
		createRoot(document.getElementById('root')).render(
			<UIProvider>
				<LanguageProvider>
					<App />
				</LanguageProvider>
			</UIProvider>
		);
	} catch (err) {
		// visible error in the page
		console.error('Render error:', err);
		const root = document.getElementById('root');
		if (root) {
			root.innerHTML = `<pre style="color:crimson; padding:1rem;">Render error:\n${String(err).replace(/</g, '&lt;')}</pre>`;
		}
	}
};

mount();
