document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('has-js');

    const header = document.querySelector('.header');
    const form = document.getElementById('contactForm');
    const emailInput = document.getElementById('email');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function getErrorElement(input) {
        return input.parentElement.querySelector('.form__error');
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
    }

    function showError(input, message) {
        const errorElement = getErrorElement(input);
        if (errorElement) {
            errorElement.textContent = message;
        }
        input.parentElement.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
    }

    function clearError(input) {
        const errorElement = getErrorElement(input);
        if (errorElement) {
            errorElement.textContent = '';
        }
        input.parentElement.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
    }

    function setFormStatus(message, type) {
        formStatus.textContent = message;
        formStatus.classList.remove('is-success', 'is-error');
        if (type) {
            formStatus.classList.add(type);
        }
    }

    window.addEventListener('scroll', () => {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
    }, { passive: true });

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.reveal').forEach((element) => {
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.92) {
                element.classList.add('is-visible');
                return;
            }
            observer.observe(element);
        });
    } else {
        document.querySelectorAll('.reveal').forEach((element) => {
            element.classList.add('is-visible');
        });
    }

    const inputs = form.querySelectorAll('input, textarea');

    inputs.forEach((input) => {
        input.addEventListener('input', () => {
            if (input.type === 'email') {
                if (validateEmail(input.value)) {
                    clearError(input);
                }
                return;
            }

            if (input.value.trim() !== '') {
                clearError(input);
            }
        });
    });

    emailInput.addEventListener('blur', () => {
        if (!emailInput.value.trim()) {
            return;
        }

        if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Formato inválido. Ejemplo: juan@gmail.com');
        } else {
            clearError(emailInput);
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        let isValid = true;
        const formData = new FormData(form);

        for (const [key, value] of formData.entries()) {
            const input = form.elements[key];
            if (!value.trim()) {
                showError(input, 'Campo obligatorio');
                isValid = false;
            } else if (key === 'email' && !validateEmail(value)) {
                showError(input, 'Formato inválido. Ejemplo: juan@gmail.com');
                isValid = false;
            } else {
                clearError(input);
            }
        }

        if (!isValid) {
            setFormStatus('', '');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        setFormStatus('', '');

        try {
            const response = await fetch('https://formspree.io/f/mkgrwzej', {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('No se pudo enviar el mensaje');
            }

            setFormStatus('Mensaje enviado. Te responderé a la brevedad.', 'is-success');
            form.reset();
        } catch (error) {
            setFormStatus('Hubo un error al enviar el mensaje. Intenta nuevamente.', 'is-error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar mensaje';
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                return;
            }

            const target = document.querySelector(href);
            if (!target) {
                return;
            }

            event.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        });
    });
});
