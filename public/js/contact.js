document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!(form instanceof HTMLFormElement)) return;

    const status = document.getElementById('contact-status');
    const success = document.getElementById('contact-success');
    const submitButton = form.querySelector('button[type="submit"]');
    const submitLabel = form.querySelector('[data-submit-label]');
    const contextInput = document.getElementById('contact-context');
    const endpoint = form.dataset.endpoint?.trim();

    const params = new URLSearchParams(window.location.search);
    const contextParts = [];
    if (params.get('topic')) contextParts.push(`topic: ${params.get('topic')}`);
    if (params.get('case')) contextParts.push(`case: ${params.get('case')}`);
    if (contextInput instanceof HTMLInputElement) {
        contextInput.value = contextParts.join(' / ');
    }

    const fields = [
        {
            element: document.getElementById('contact-name'),
            message: '請填寫姓名。',
        },
        {
            element: document.getElementById('contact-email'),
            message: '請填寫可聯絡的 Email。',
            invalidMessage: '請確認 Email 格式。',
        },
        {
            element: document.getElementById('contact-message'),
            message: '請簡單告訴我們想詢問的內容。',
        },
    ];

    function showFieldError(field, message = '') {
        if (!(field.element instanceof HTMLElement)) return;
        const error = form.querySelector(`[data-error-for="${field.element.id}"]`);
        field.element.setAttribute('aria-invalid', message ? 'true' : 'false');
        if (error) error.textContent = message;
    }

    function validateField(field) {
        if (!(field.element instanceof HTMLInputElement || field.element instanceof HTMLTextAreaElement)) {
            return true;
        }

        const value = field.element.value.trim();
        let message = '';

        if (field.element.required && !value) {
            message = field.message;
        } else if (value && !field.element.checkValidity()) {
            message = field.invalidMessage || field.message;
        }

        showFieldError(field, message);
        return !message;
    }

    fields.forEach((field) => {
        field.element?.addEventListener('blur', () => validateField(field));
        field.element?.addEventListener('input', () => {
            if (field.element?.getAttribute('aria-invalid') === 'true') validateField(field);
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (status) status.textContent = '';

        const isValid = fields.map(validateField).every(Boolean);
        if (!isValid) {
            const firstInvalid = fields.find((field) => field.element?.getAttribute('aria-invalid') === 'true');
            firstInvalid?.element?.focus();
            return;
        }

        const honeypot = form.elements.namedItem('website');
        if (honeypot instanceof HTMLInputElement && honeypot.value) return;

        if (!endpoint) {
            if (status) status.textContent = '表單寄送功能目前尚未啟用，請稍後再試。';
            return;
        }

        if (submitButton instanceof HTMLButtonElement) submitButton.disabled = true;
        if (submitLabel) submitLabel.textContent = '正在送出…';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) throw new Error(`Contact form failed with ${response.status}`);

            form.hidden = true;
            const header = document.querySelector('.contact-form-header');
            if (header instanceof HTMLElement) header.hidden = true;
            if (success instanceof HTMLElement) {
                success.hidden = false;
                success.focus();
            }
            form.reset();
        } catch (error) {
            console.error(error);
            if (status) status.textContent = '目前無法送出，請稍後再試。';
        } finally {
            if (submitButton instanceof HTMLButtonElement) submitButton.disabled = false;
            if (submitLabel) submitLabel.textContent = '送出詢問';
        }
    });
});
