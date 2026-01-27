// Мобильное меню
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobileMenuBtn && navMenu) {
	mobileMenuBtn.addEventListener('click', () => {
		navMenu.classList.toggle('active');
		mobileMenuBtn.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
	});
	
	// Закрытие меню при клике на ссылку
	document.querySelectorAll('.nav-link').forEach(link => {
		link.addEventListener('click', () => {
			navMenu.classList.remove('active');
			mobileMenuBtn.textContent = '☰';
		});
	});
}

// FAQ аккордеон
document.querySelectorAll('.faq-question').forEach(question => {
	question.addEventListener('click', () => {
		const item = question.parentElement;
		const isActive = item.classList.contains('active');
		
		// Закрываем все открытые элементы
		document.querySelectorAll('.faq-item').forEach(el => {
			el.classList.remove('active');
			el.querySelector('.faq-answer').style.maxHeight = null;
		});
		
		// Если элемент не был активен, открываем его
		if (!isActive) {
			item.classList.add('active');
			const answer = item.querySelector('.faq-answer');
			answer.style.maxHeight = answer.scrollHeight + 'px';
		}
	});
});

// Форма обратной связи
const contactForm = document.getElementById('contactForm');
if (contactForm) {
	contactForm.addEventListener('submit', (e) => {
		e.preventDefault();
		
		// Получаем данные формы
		const name = contactForm.querySelector('input[type="text"]').value;
		const phone = contactForm.querySelector('input[type="tel"]').value;
		
		// В реальном приложении здесь был бы AJAX-запрос
		alert(`Спасибо, ${name}! Ваша заявка принята. Мы свяжемся с вами по номеру ${phone} в ближайшее время.`);
		contactForm.reset();
	});
}

// Плавная прокрутка для якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	anchor.addEventListener('click', function(e) {
		e.preventDefault();
		
		const targetId = this.getAttribute('href');
		if (targetId === '#') return;
		
		const targetElement = document.querySelector(targetId);
		if (targetElement) {
			window.scrollTo({
				top: targetElement.offsetTop - 80,
				behavior: 'smooth'
			});
		}
	});
});
