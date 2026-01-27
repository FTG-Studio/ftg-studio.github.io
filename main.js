// Initialize and load content when page loads
document.addEventListener('DOMContentLoaded', () => {
	window.contentLoader = new ContentLoader();
	
	// Add a manual refresh button
	const refreshButton = document.createElement('button');
	refreshButton.className = 'refresh-button';
	refreshButton.textContent = '🔄';
	refreshButton.title = translations[window.contentLoader.currentLang].loading;
	
	refreshButton.addEventListener('click', () => {
		location.reload();
	});
	
	document.body.appendChild(refreshButton);
});
