document.addEventListener('DOMContentLoaded', () => {
    // === Funciones declaradas con function ===

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.toLowerCase());
    }

    function showError(input, message) {
        let errorElement = input.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('form__error')) {
            errorElement = document.createElement('span');
            errorElement.className = 'form__error';
            errorElement.setAttribute('aria-live', 'polite');
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
        errorElement.textContent = message;
        input.style.borderBottomColor = 'var(--color-error)';
    }

    function clearError(input) {
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('form__error')) {
            errorElement.textContent = '';
        }
        input.style.borderBottomColor = '';
    }

    // === Inicio de lógica principal ===

    const form = document.getElementById('contactForm');
    const emailInput = document.getElementById('email');

    // Limpiar errores al escribir, excepto en el campo de tipo email
    const inputs = form.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        if (input.type !== 'email') {
            input.addEventListener('input', () => {
                if (input.value.trim() !== '') {
                    clearError(input);
                }
            });
        }
    });

    // Validar email al salir del campo (blur)
    emailInput.addEventListener('blur', () => {
        if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Formato inválido. Ejemplo: juan@gmail.com');
        } else {
            clearError(emailInput);
        }
    });

    // Si el email se vuelve válido mientras escribe, limpiar error
    emailInput.addEventListener('input', () => {
        if (validateEmail(emailInput.value)) {
            clearError(emailInput);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        let isValid = true;
        const formData = new FormData(form);
    
        for (const [key, value] of formData.entries()) {
            const input = form.elements[key];
            if (!value.trim()) {
                showError(input, "Campo obligatorio");
                isValid = false;
            } else if (key === 'email' && !validateEmail(value)) {
                showError(input, 'Formato inválido. Ejemplo: juan@gmail.com');
                isValid = false;
            } else {
                clearError(input);
            }
        }
    
        // ✅ Si el formulario pasa todas las validaciones
        if (isValid) {
            try {
                const response = await fetch("https://formspree.io/f/mkgrwzej", {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
    
                const successMessage = document.createElement('div');
                successMessage.textContent = "Mensaje enviado exitosamente";
                successMessage.style.color = 'var(--color-primario)';
                successMessage.style.marginTop = 'var(--spacing-m)';
                form.appendChild(successMessage);
    
                form.reset();
    
                setTimeout(() => {
                    successMessage.remove();
                }, 3000);
    
            } catch (error) {
                const errorMessage = document.createElement('div');
                errorMessage.textContent = "Hubo un error al enviar el mensaje. Intenta nuevamente.";
                errorMessage.style.color = 'var(--color-error)';
                errorMessage.style.marginTop = 'var(--spacing-m)';
                form.appendChild(errorMessage);
    
                setTimeout(() => {
                    errorMessage.remove();
                }, 4000);
            }
        }
    });

    // Smooth scrolling para navegación interna
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
