// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobileMenuBtn && navMenu) {
	mobileMenuBtn.addEventListener('click', () => {
		navMenu.classList.toggle('active');
		mobileMenuBtn.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
	});
	
	// Close mobile menu when clicking on a link
	document.querySelectorAll('.nav-link').forEach(link => {
		link.addEventListener('click', () => {
			navMenu.classList.remove('active');
			if (mobileMenuBtn) {
				mobileMenuBtn.textContent = '☰';
			}
		});
	});
}

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(question => {
	question.addEventListener('click', () => {
		const faqItem = question.parentElement;
		const answer = faqItem.querySelector('.faq-answer');
		
		// Close other open items
		document.querySelectorAll('.faq-item').forEach(item => {
			if (item !== faqItem) {
				item.classList.remove('active');
				const otherAnswer = item.querySelector('.faq-answer');
				if (otherAnswer) {
					otherAnswer.classList.remove('open');
				}
			}
		});
		
		// Toggle current item
		faqItem.classList.toggle('active');
		if (answer) {
			answer.classList.toggle('open');
		}
	});
});

// Form submission
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm && formMessage) {
	contactForm.addEventListener('submit', (e) => {
		e.preventDefault();
		
		// Simple form validation
		const name = document.getElementById('name')?.value;
		const phone = document.getElementById('phone')?.value;
		
		if (!name || !phone) {
			formMessage.innerHTML = '<p style="color: red;">Пожалуйста, заполните все обязательные поля</p>';
			return;
		}
		
		// Simulate form submission
		formMessage.innerHTML = '<p style="color: green;">Спасибо! Ваша заявка отправлена. Я свяжусь с вами в ближайшее время.</p>';
		contactForm.reset();
		
		// Clear message after 5 seconds
		setTimeout(() => {
			formMessage.innerHTML = '';
		}, 5000);
	});
}

// Phone mask
const phoneInput = document.getElementById('phone');
if (phoneInput) {
	phoneInput.addEventListener('input', (e) => {
		let value = e.target.value.replace(/\D/g, '');
		
		if (value.length > 0) {
			value = '+7 (' + value.substring(1, 4) + ') ' + value.substring(4, 7) + '-' + value.substring(7, 9) + '-' + value.substring(9, 11);
		}
		
		e.target.value = value;
	});
}

// Header shadow on scroll
window.addEventListener('scroll', () => {
	const header = document.querySelector('header');
	if (header) {
		if (window.scrollY > 50) {
			header.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
		} else {
			header.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.05)';
		}
	}
});

// Animate elements on scroll
const observerOptions = {
	threshold: 0.1,
	rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			entry.target.style.opacity = '1';
			entry.target.style.transform = 'translateY(0)';
		}
	});
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.card, .portfolio-item, .faq-item').forEach(el => {
	el.style.opacity = '0';
	el.style.transform = 'translateY(20px)';
	el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
	observer.observe(el);
});
