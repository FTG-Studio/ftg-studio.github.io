class ContentLoader {
	constructor() {
		this.currentType = localStorage.getItem('contentType') || 'sites'; // По умолчанию сайты
		this.currentLang = localStorage.getItem('lang') || 'en';
		this.content = [];
		this.currentId = 1;
		this.maxId = 100;
		this.isLoading = false;
		this.init();
	}

	init() {
		// Устанавливаем атрибут data-content-type на body для стилей
		document.body.dataset.contentType = this.currentType;
		this.setLanguage(this.currentLang, false);
		this.setContentType(this.currentType, false);
		this.setupEventListeners();
		this.loadContent();
	}

	setupEventListeners() {
		// Language switcher
		document.querySelectorAll('.lang-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const lang = e.target.dataset.lang;
				this.setLanguage(lang);
			});
		});

		// Content type switcher
		document.querySelectorAll('.content-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const type = e.target.dataset.type;
				this.setContentType(type);
			});
		});
	}

	setLanguage(lang, reload = true) {
		this.currentLang = lang;
		localStorage.setItem('lang', lang);
		document.documentElement.lang = lang;
		
		// Update active button
		document.querySelectorAll('.lang-btn').forEach(btn => {
			btn.classList.toggle('active', btn.dataset.lang === lang);
		});
		
		// Update UI texts
		this.updateTexts();
		
		// Re-render content with new language
		if (reload && this.content.length > 0) {
			this.displayContent();
		}
	}

	setContentType(type, reload = true) {
		this.currentType = type;
		localStorage.setItem('contentType', type);
		
		// Update active button
		document.querySelectorAll('.content-btn').forEach(btn => {
			btn.classList.toggle('active', btn.dataset.type === type);
		});
		
		// Update counter style
		document.body.dataset.contentType = type;
		
		// Reset for new content type
		this.content = [];
		this.currentId = 1;
		
		// Update UI texts
		this.updateTexts();
		
		// Обновляем счетчик сразу
		this.updateCounter();
		
		// Load new content
		if (reload) {
			this.loadContent();
		}
	}

	updateTexts() {
		const t = translations[this.currentLang];
		const type = this.currentType;
		
		// Update static texts
		document.getElementById('subtitle').textContent = t.subtitle;
		document.getElementById('games-btn').textContent = t.gamesTab;
		document.getElementById('sites-btn').textContent = t.sitesTab;
		document.getElementById('footer-text').textContent = t.footer;
		document.getElementById('copyright-text').textContent = t.copyright;
		
		// Update counter if content is loaded
		if (this.content.length > 0) {
			this.updateCounter();
		}
	}

	updateCounter() {
		const t = translations[this.currentLang];
		const countElement = document.getElementById('counter-text');
		const count = this.content.length;
		
		if (this.currentType === 'games') {
			countElement.textContent = t.gamesFound.replace('{count}', count);
		} else {
			countElement.textContent = t.sitesFound.replace('{count}', count);
		}
	}

	async loadContent() {
		this.isLoading = true;
		const loadingElement = document.getElementById('loading');
		const container = document.getElementById('content-container');
		
		container.innerHTML = '';
		loadingElement.style.display = 'block';
		loadingElement.textContent = translations[this.currentLang].loading;
		
		try {
			const basePath = this.currentType === 'games' ? 'games' : 'sites';
			const rootTag = this.currentType === 'games' ? 'Game' : 'Site';
			
			while (this.currentId <= this.maxId) {
				loadingElement.textContent = 
					translations[this.currentLang].loadingItem.replace('{id}', this.currentId);
				
				try {
					const item = await this.loadItem(basePath, rootTag, this.currentId);
					if (item) {
						this.content.push(item);
					}
				} catch (error) {
					if (error.message.includes('404')) {
						// No more items found
						break;
					} else {
						console.warn(`${translations[this.currentLang].errorFetching.replace('{id}', this.currentId)}:`, error);
					}
				}
				this.currentId++;
			}

			if (this.content.length === 0) {
				this.showNoContentMessage();
			} else {
				this.displayContent();
			}
		} catch (error) {
			this.showError(translations[this.currentLang].errorLoading);
			console.error('Error loading content:', error);
		} finally {
			loadingElement.style.display = 'none';
			this.isLoading = false;
		}
	}

	async loadItem(basePath, rootTag, id) {
		const xmlPath = `${basePath}/${id}/${basePath.slice(0, -1)}.xml`;
		
		try {
			const response = await fetch(xmlPath);
			
			if (!response.ok) {
				if (response.status === 404) {
					throw new Error(translations[this.currentLang].itemNotFound.replace('{id}', id));
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const xmlText = await response.text();
			return this.parseItemXML(xmlText, rootTag, basePath, id);
		} catch (error) {
			throw error;
		}
	}

	parseItemXML(xmlText, rootTag, basePath, id) {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(xmlText, "text/xml");
		
		// Check for parsing errors
		const parserError = xmlDoc.querySelector('parsererror');
		if (parserError) {
			console.error(`XML parsing error for ${rootTag} ${id}:`, parserError.textContent);
			throw new Error(`Invalid XML for ${rootTag} ${id}`);
		}
		
		// Get root element
		const rootElement = xmlDoc.querySelector(rootTag);
		if (!rootElement) {
			throw new Error(`Root element <${rootTag}> not found`);
		}
		
		// Extract default info (without lang attribute)
		const defaultInfo = rootElement.querySelector('Info:not([lang])');
		const defaultData = this.extractInfoData(defaultInfo);
		
		// Extract all language-specific infos
		const infoElements = rootElement.querySelectorAll('Info[lang]');
		const infos = {};
		const availableLangs = [];
		
		infoElements.forEach(info => {
			const lang = info.getAttribute('lang');
			const langData = this.extractInfoData(info);
			
			// Merge with default data (default fills missing fields)
			const mergedData = {};
			
			// First take all from default data
			Object.keys(defaultData).forEach(key => {
				mergedData[key] = defaultData[key];
			});
			
			// Then overwrite with language-specific data
			Object.keys(langData).forEach(key => {
				if (langData[key]) { // only if there is a value
					mergedData[key] = langData[key];
				}
			});
			
			infos[lang] = mergedData;
			
			if (!availableLangs.includes(lang)) {
				availableLangs.push(lang);
			}
		});
		
		// If no language-specific infos, create from default
		if (Object.keys(infos).length === 0) {
			const itemName = rootTag === 'Game' ? 'Game' : 'Site';
			infos['default'] = {
				...defaultData,
				name: defaultData.name || `${itemName} ${id}`
			};
			availableLangs.push('default');
		}
		
		// If still no data, create default
		if (Object.keys(infos).length === 0) {
			const itemName = rootTag === 'Game' ? 'Game' : 'Site';
			infos['en'] = {
				name: `${itemName} ${id}`,
				description: '',
				preview: 'preview.jpg',
				indexPage: rootTag === 'Game' ? 'play/index.html' : 'www/index.html'
			};
			availableLangs.push('en');
		}
		
		// Ensure all language entries have at least default preview and indexPage
		Object.keys(infos).forEach(lang => {
			if (!infos[lang].preview && defaultData.preview) {
				infos[lang].preview = defaultData.preview;
			}
			if (!infos[lang].indexPage && defaultData.indexPage) {
				infos[lang].indexPage = defaultData.indexPage;
			}
		});
		
		return {
			id,
			type: rootTag === 'Game' ? 'game' : 'site',
			infos,
			availableLangs,
			basePath,
			folder: `${basePath}/${id}`,
			defaultData
		};
	}

	extractInfoData(infoElement) {
		if (!infoElement) return {};
		
		const name = infoElement.querySelector('Name')?.textContent?.trim() || '';
		const description = infoElement.querySelector('Description')?.textContent?.trim() || '';
		const preview = infoElement.querySelector('Preview')?.textContent?.trim() || '';
		const indexPage = infoElement.querySelector('IndexPage')?.textContent?.trim() || '';
		
		return {
			name,
			description,
			preview,
			indexPage
		};
	}

	displayContent() {
		const container = document.getElementById('content-container');
		container.innerHTML = '';
		
		// Update counter
		this.updateCounter();
		
		// Create content cards
		this.content.forEach(item => {
			const card = this.createCard(item);
			container.appendChild(card);
		});
	}

	createCard(item) {
		const card = document.createElement('div');
		card.className = 'card';
		card.dataset.id = item.id;
		card.dataset.type = item.type;
		
		// Get localized data for current language
		let itemData = item.infos[this.currentLang];
		
		// If no data for current language, use first available language
		if (!itemData) {
			const firstLang = item.availableLangs[0];
			itemData = item.infos[firstLang] || {};
		}
		
		// Ensure we have at least default values
		if (!itemData.name) {
			itemData.name = `${item.type === 'game' ? 'Game' : 'Site'} ${item.id}`;
		}
		if (!itemData.preview && item.defaultData?.preview) {
			itemData.preview = item.defaultData.preview;
		}
		if (!itemData.indexPage && item.defaultData?.indexPage) {
			itemData.indexPage = item.defaultData.indexPage;
		}
		
		// If still no indexPage, create default
		if (!itemData.indexPage) {
			itemData.indexPage = item.type === 'game' ? 'play/index.html' : 'www/index.html';
		}
		
		// Construct paths
		const previewPath = itemData.preview ? 
			`${item.basePath}/${item.id}/${itemData.preview}` : 
			'';
		const indexPagePath = itemData.indexPage ? 
			`${item.basePath}/${item.id}/${itemData.indexPage}` : 
			`${item.basePath}/${item.id}/`;
		
		// Create card content
		card.innerHTML = `
			<div class="preview-container">
				<div class="card-type ${item.type}">${item.type === 'game' ? '🎮 Game' : '🌐 Site'}</div>
				${previewPath ? `
					<img 
						src="${previewPath}" 
						alt="${itemData.name}" 
						class="preview"
						onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
						loading="lazy"
					>
				` : ''}
				<div class="preview-overlay" style="display: ${previewPath ? 'none' : 'flex'};">
					<span>${itemData.name}</span>
					<span style="font-size: 12px; color: #94a3b8;">No preview available</span>
				</div>
			</div>
			<div class="card-info">
				<h3 class="card-title">${itemData.name}</h3>
				<p class="card-description">${itemData.description || translations[this.currentLang].noDescription}</p>
				<a href="${indexPagePath}" class="card-button ${item.type}" target="_blank">
					${item.type === 'game' ? translations[this.currentLang].playButton : translations[this.currentLang].visitButton}
				</a>
			</div>
		`;
		
		// Add click event to the entire card
		card.addEventListener('click', (e) => {
			if (!e.target.classList.contains('card-button') &&
				e.target.tagName !== 'A') {
				window.open(indexPagePath, '_blank');
			}
		});
		
		return card;
	}

	showNoContentMessage() {
		const container = document.getElementById('content-container');
		const t = translations[this.currentLang];
		const type = this.currentType;
		
		const noContentMsg = type === 'games' ? t.noGames : t.noSites;
		const folderStructure = type === 'games' ? 
			'games/{id}/game.xml' : 
			'sites/{id}/site.xml';
		
		// Обновляем счетчик перед показом сообщения
		this.updateCounter();
		
		container.innerHTML = `
			<div class="no-content">
				<p>${noContentMsg}</p>
				<p>${t.noContentInstructions}</p>
				<p><code>${folderStructure}</code></p>
			</div>
		`;
	}

	showError(message) {
		const errorElement = document.getElementById('error-message');
		errorElement.textContent = message;
		errorElement.style.display = 'block';
	}
}
