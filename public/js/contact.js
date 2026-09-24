document.addEventListener('astro:page-load', () => {
    // Check if we are on the contact page
    const inquiryForm = document.getElementById('inquiry-form');
    if (!inquiryForm) return;

    let currentStep = 1;
    const totalSteps = 4; // 1, 2, 3, 4 (Review)

    const nextBtns = document.querySelectorAll('.next-btn, .review-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const progressSteps = document.querySelectorAll('.progress-step');
    const formSteps = document.querySelectorAll('.form-step');

    // Navigation logic
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                if (currentStep < totalSteps) {
                    currentStep++;
                    if (currentStep === 4) {
                        generateSummary();
                    }
                    updateFormSteps();
                }
            } else {
                // Trigger HTML5 validation UI if available
                inquiryForm.reportValidity();
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateFormSteps();
            }
        });
    });

    function updateFormSteps() {
        // Update Form Display
        formSteps.forEach(step => {
            const stepNum = parseInt(step.getAttribute('data-step'));
            if (stepNum === currentStep) {
                step.style.display = 'block';
                // Trigger reflow for animation
                void step.offsetWidth;
                step.classList.add('active');
            } else {
                step.style.display = 'none';
                step.classList.remove('active');
            }
        });

        // Update Progress Indicator
        // The progress indicator only has 3 visual steps. 
        // When on step 4 (Review), step 3 should still be active/completed.
        progressSteps.forEach((step, index) => {
            const stepNum = index + 1;
            if (stepNum < currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepNum === currentStep || (currentStep === 4 && stepNum === 3)) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function validateStep(step) {
        if (step === 1) {
            const name = document.getElementById('name').value;
            const company = document.getElementById('company').value;
            const email = document.getElementById('email').value;
            return name && company && email && document.getElementById('email').checkValidity();
        }
        // Steps 2 and 3 don't have hard validation requirements per the prompt
        return true; 
    }

    // Generate Review Summary
    function generateSummary() {
        const summaryData = document.getElementById('summary-data');
        if (!summaryData) return;

        // Step 1: Basic Info
        const name = document.getElementById('name').value;
        const company = document.getElementById('company').value;
        const email = document.getElementById('email').value;
        
        // Step 2: Project Overview
        const needType = document.querySelector('input[name="need_type"]:checked')?.value || '未填寫';
        const deviceType = document.querySelector('input[name="device_type"]:checked')?.value || '未填寫';
        const projectStage = document.querySelector('input[name="project_stage"]:checked')?.value || '未填寫';
        
        const concerns = Array.from(document.querySelectorAll('input[name="concerns"]:checked')).map(cb => cb.value);
        const concernsStr = concerns.length > 0 ? concerns.join('、') : '未選擇';

        // Step 3: Engineering Conditions (Readiness)
        const readyItems = [
            { name: 'ready_dim', label: '設備尺寸' },
            { name: 'ready_weight', label: '設備重量' },
            { name: 'ready_cg', label: '設備重心位置' },
            { name: 'ready_space', label: '安裝/可用位移空間' },
            { name: 'ready_floor', label: '樓板/高架地板條件' },
            { name: 'ready_pipes', label: '既有管線/線路限制' },
            { name: 'ready_spec', label: '耐震規格/性能要求' }
        ];

        let readinessHtml = '<ul class="summary-ul">';
        readyItems.forEach(item => {
            const isReady = document.querySelector(`input[name="${item.name}"]:checked`)?.value === 'yes';
            if (isReady) {
                readinessHtml += `<li class="checked"><span class="material-symbols-outlined" style="font-size: 16px;">check</span> ${item.label}</li>`;
            } else {
                readinessHtml += `<li class="unchecked"><span class="material-symbols-outlined" style="font-size: 16px;">circle</span> ${item.label}尚未確認</li>`;
            }
        });
        readinessHtml += '</ul>';

        // Build HTML
        summaryData.innerHTML = `
            <div class="summary-block">
                <p class="summary-label">CONTACT INFO</p>
                <p class="summary-value">${name} / ${company}</p>
                <p style="font-size: 14px; color: var(--text-color);">${email}</p>
            </div>
            
            <div class="summary-block">
                <p class="summary-label">APPLICATION & TYPE</p>
                <p class="summary-value">${deviceType} - ${needType}</p>
            </div>

            <div class="summary-block">
                <p class="summary-label">PROJECT STAGE</p>
                <p class="summary-value">${projectStage}</p>
            </div>

            <div class="summary-block">
                <p class="summary-label">MAIN CONCERNS</p>
                <p class="summary-value">${concernsStr}</p>
            </div>

            <div class="summary-block">
                <p class="summary-label">AVAILABLE INFORMATION</p>
                ${readinessHtml}
            </div>
        `;
    }

    // Handle Form Submit
    inquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Hide form and progress
        inquiryForm.style.display = 'none';
        document.querySelector('.progress-container').style.display = 'none';
        document.querySelector('.contact-intro').style.display = 'none';
        document.querySelector('.general-contact-link').style.display = 'none';
        document.querySelector('.contact-title').style.display = 'none';
        
        // Show success state
        const successState = document.getElementById('success-state');
        successState.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
