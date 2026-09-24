/* =========================================
   Language navigation: keep reading position
   ========================================= */
(() => {
    if (window.__vioLanguageNavigationReady) return;
    window.__vioLanguageNavigationReady = true;

    const storageKey = 'vio-language-position';
    const maxRecordAge = 10000;

    const getPageProgress = () => {
        const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        return Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    };

    const getSectionPosition = () => {
        const viewportReference = window.innerHeight * 0.35;
        const sections = Array.from(document.querySelectorAll('[data-language-section]'));
        const currentSection = sections.find(section => {
            const rect = section.getBoundingClientRect();
            return rect.top <= viewportReference && rect.bottom > viewportReference;
        });

        if (!currentSection) return null;

        const rect = currentSection.getBoundingClientRect();
        const sectionTop = window.scrollY + rect.top;
        const availableDistance = Math.max(rect.height - window.innerHeight, 1);

        return {
            key: currentSection.dataset.languageSection,
            progress: Math.min(Math.max((window.scrollY - sectionTop) / availableDistance, 0), 1)
        };
    };

    const restoreLanguagePosition = removeAfterRestore => {
        const rawRecord = sessionStorage.getItem(storageKey);
        if (!rawRecord) return;

        try {
            const record = JSON.parse(rawRecord);
            if (Date.now() - record.createdAt > maxRecordAge || location.pathname !== record.targetPath) {
                sessionStorage.removeItem(storageKey);
                return;
            }

            const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
            let targetY = record.pageProgress * maxScroll;
            const matchingSection = record.section?.key
                ? document.querySelector(`[data-language-section="${record.section.key}"]`)
                : null;

            if (matchingSection) {
                const rect = matchingSection.getBoundingClientRect();
                const sectionTop = window.scrollY + rect.top;
                const availableDistance = Math.max(rect.height - window.innerHeight, 0);
                targetY = sectionTop + record.section.progress * availableDistance;
            }

            window.scrollTo({ top: Math.min(Math.max(targetY, 0), maxScroll), left: 0, behavior: 'instant' });
            if (removeAfterRestore) sessionStorage.removeItem(storageKey);
        } catch (_error) {
            sessionStorage.removeItem(storageKey);
        }
    };

    document.addEventListener('click', event => {
        const languageLink = event.target.closest('a[data-language-switch]');
        if (!languageLink || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const targetUrl = new URL(languageLink.href, location.href);
        if (targetUrl.origin !== location.origin) return;
        if (targetUrl.pathname === location.pathname) {
            event.preventDefault();
            return;
        }

        sessionStorage.setItem(storageKey, JSON.stringify({
            targetPath: targetUrl.pathname,
            pageProgress: getPageProgress(),
            section: getSectionPosition(),
            createdAt: Date.now()
        }));
    });

    document.addEventListener('astro:after-swap', () => restoreLanguagePosition(false));
    document.addEventListener('astro:page-load', () => requestAnimationFrame(() => restoreLanguagePosition(true)));
})();

document.addEventListener('astro:page-load', () => {
    /* =========================================
       1. Header Scroll Behavior (Sticky, no hide)
       ========================================= */
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // 如果在最頂端，移除懸浮樣式，恢復預設(毛玻璃)
        if (currentScrollY <= 50 && !header.hasAttribute('data-solid')) {
            header.classList.remove('is-floating');
        } 
        // 只要離開頂部，就顯示純色懸浮 Header (不再隱藏)
        else {
            header.classList.add('is-floating');
        }
    }, { passive: true });


    /* =========================================
       2. Dark/Light Mode Toggle
       ========================================= */
    const themeToggleBtns = document.querySelectorAll('[data-theme-toggle]');
    const htmlElement = document.documentElement;

    // Check localStorage for saved theme, fallback to system preference
    const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const savedTheme = localStorage.getItem('vio-theme') || getSystemTheme();
    setTheme(savedTheme);

    themeToggleBtns.forEach(button => button.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    }));

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('vio-theme', theme);
    }

    /* =========================================
       3. Mobile Menu Toggle
       ========================================= */
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        const setMenuOpen = (open) => {
            navLinks.classList.toggle('active', open);
            mobileMenuBtn.setAttribute('aria-expanded', String(open));
        };
        mobileMenuBtn.addEventListener('click', () => {
            setMenuOpen(!navLinks.classList.contains('active'));
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setMenuOpen(false));
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navLinks.classList.contains('active')) {
                setMenuOpen(false);
                mobileMenuBtn.focus();
            }
        });
        window.matchMedia('(max-width: 1400px)').addEventListener('change', (event) => {
            if (!event.matches) setMenuOpen(false);
        });
    }

    /* =========================================
       4. Force Video Autoplay (Safari fix)
       ========================================= */
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        heroVideo.play().catch(e => {
            // Autoplay prevented by browser, usually requires user interaction
            console.log('Autoplay prevented:', e);
        });
    }
    /* =========================================
       5. Number Counter Animation
       ========================================= */
    const counters = document.querySelectorAll('.counter');

    // easeOutQuad 減速更為線性，不會在最後 10% 的時間卡在同一個數字上
    const easeOutQuad = t => t * (2 - t);

    const animateCounters = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                
                // RWD 關閉數字動效，直接顯示最終數字以避免畫面不必要晃動
                if (window.innerWidth <= 768) {
                    counter.innerText = target.toLocaleString();
                    observer.unobserve(counter);
                    return;
                }

                let startTime = null;
                
                // 縮短動畫時間，讓數字跑得更快更俐落
                const duration = target < 20 ? 800 : 1200;
                
                // 較大的數字（如 3000）從 1000 開始跳動，兼顧動態感與沉穩
                // 1000 則直接從 0 開始
                const startValue = target > 2000 ? target - 2000 : 0; 
                
                const updateCount = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    const easedProgress = easeOutQuad(progress); // 使用 easeOutQuad 避免提早停頓
                    
                    const currentCount = Math.floor(startValue + (target - startValue) * easedProgress);
                    
                    counter.innerText = currentCount.toLocaleString();
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        counter.innerText = target.toLocaleString();
                    }
                };
                
                requestAnimationFrame(updateCount);
                observer.unobserve(counter); // Only animate once when scrolled into view
            }
        });
    };

    const counterObserver = new IntersectionObserver(animateCounters, {
        threshold: 0.5 // Trigger when 50% of the element is visible
    });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    /* =========================================
       6. Solutions Slider Logic
       ========================================= */
    const solutionsData = [
        {
            title: "設備與儀器隔震",
            desc: `
                <p class="card-desc tc-text">針對半導體精密設備、分析儀器與關鍵控制設備，依設備重量、重心與安裝條件規劃隔震或振動控制配置。透過降低地震輸入與設備反應，減少對運轉穩定性與精度的影響。</p>
            
                <div class="card-section footer-section">
                    <h5 class="section-title tc-text">對應核心元件</h5>
                    <p class="section-desc tc-text" style="font-weight: 500; color: var(--primary-red);">MRB 通用型/重型隔震平台、VIOBase 2.0 專利平台、TMD 調諧質量阻尼器。</p>
                </div>
            `,
            img: "https://via.placeholder.com/800x600/e0e0e0/666666?text=Device+Isolation"
        },
        {
            title: "機櫃與典藏櫃隔震",
            desc: `
                <p class="card-desc tc-text">適用於伺服器機櫃、多櫃組合與文物展示／典藏櫃，依櫃體形式配置隔震支承與連接方式。兼顧櫃體穩定與內部設備、資料或典藏物的防護需求。</p>
            
                <div class="card-section footer-section">
                    <h5 class="section-title tc-text">對應核心元件</h5>
                    <p class="section-desc tc-text" style="font-weight: 500; color: var(--primary-red);">MRB 35WD / 40WD / 45WD（精巧型）、MRB 30SD / 60WD（通用型）、VIOBase 1.0 / 2.0</p>
                </div>
            `,
            img: "https://via.placeholder.com/800x600/e0e0e0/666666?text=Server+Isolation"
        },
        {
            title: "區域與高架地板隔震",
            desc: `
                <p class="card-desc tc-text">透過隔震單元、模組化框架與高架地板整合形成整體隔震區，適用於資料中心、資訊機房與多設備場域。可同步納入設備配置、線纜、動線與隔震位移空間的整體規劃。</p>
            
                <div class="card-section footer-section">
                    <h5 class="section-title tc-text">對應核心元件</h5>
                    <p class="section-desc tc-text" style="font-weight: 500; color: var(--primary-red);">MRB 隔震高架地板模組化系統（配置 MRB 30WD / 60WD）。</p>
                </div>
            `,
            img: "https://via.placeholder.com/800x600/e0e0e0/666666?text=Floor+Isolation"
        },
        {
            title: "結構隔震與消能",
            desc: `
                <p class="card-desc tc-text">針對空中廊道、特殊結構連接與高承載支承需求，依荷載、位移與啟動條件規劃隔震或消能配置。兼顧日常使用條件與地震作用下的結構反應控制。</p>
            
                <div class="card-section footer-section">
                    <h5 class="section-title tc-text">對應核心元件</h5>
                    <p class="section-desc tc-text" style="font-weight: 500; color: var(--primary-red);">MRB 80B / 120B / 150B（重型）、MVE 多層黏彈性阻尼器、MAB 複合式金屬斜撐。</p>
                </div>
            `,
            img: "https://via.placeholder.com/800x600/e0e0e0/666666?text=Structural+Isolation"
        }
    ];

    const tabs = document.querySelectorAll('.tab-item');
    const imgEl = document.getElementById('solutions-img');
    const titleEl = document.getElementById('solutions-card-title');
    const descEl = document.getElementById('solutions-card-desc');
    const currentNumEl = document.getElementById('current-slide');
    const prevBtn = document.getElementById('solutions-prev');
    const nextBtn = document.getElementById('solutions-next');
    
    let currentSlideIndex = 0;

    function updateSlider(index) {
        // Remove active class from all tabs
        tabs.forEach(tab => tab.classList.remove('active'));
        // Add active class to current tab
        if(tabs[index]) tabs[index].classList.add('active');

        // Fade out elements
        imgEl.style.opacity = 0;
        titleEl.style.opacity = 0;
        descEl.style.opacity = 0;

        setTimeout(() => {
            // Update content
            const data = solutionsData[index];
            imgEl.src = data.img;
            titleEl.textContent = data.title;
            descEl.innerHTML = data.desc;
            
            // Format number (e.g. 1 -> 01)
            currentNumEl.textContent = String(index + 1).padStart(2, '0');

            // Fade in elements
            imgEl.style.opacity = 1;
            titleEl.style.opacity = 1;
            descEl.style.opacity = 1;
        }, 300); // 300ms matches the typical CSS transition time
    }

    if (tabs.length > 0) {
        // Tab Clicks
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                if (index !== currentSlideIndex) {
                    currentSlideIndex = index;
                    updateSlider(currentSlideIndex);
                }
            });
        });

        // Prev/Next Buttons
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                currentSlideIndex = (currentSlideIndex - 1 + solutionsData.length) % solutionsData.length;
                updateSlider(currentSlideIndex);
            });
            nextBtn.addEventListener('click', () => {
                currentSlideIndex = (currentSlideIndex + 1) % solutionsData.length;
                updateSlider(currentSlideIndex);
            });
        }
    }

    /* =========================================
       7. Products Carousel Logic
       ========================================= */
    const productsCarousel = document.getElementById('products-carousel');
    const pPrevBtn = document.getElementById('product-prev');
    const pNextBtn = document.getElementById('product-next');
    const productFilterButtons = document.querySelectorAll('[data-product-filter]');

    if (productsCarousel && pPrevBtn && pNextBtn) {
        const productCards = Array.from(productsCarousel.querySelectorAll('[data-product-category]'));

        const getScrollStep = () => {
            const firstCard = productCards.find(card => !card.hidden) || productsCarousel.firstElementChild;
            if (!firstCard) return productsCarousel.clientWidth;
            const gap = parseFloat(getComputedStyle(productsCarousel).gap) || 0;
            return firstCard.getBoundingClientRect().width + gap;
        };

        const updateProductControls = () => {
            const maxScrollLeft = productsCarousel.scrollWidth - productsCarousel.clientWidth;
            pPrevBtn.disabled = productsCarousel.scrollLeft <= 2;
            pNextBtn.disabled = productsCarousel.scrollLeft >= maxScrollLeft - 2;
        };

        const applyProductFilter = category => {
            productCards.forEach(card => {
                card.hidden = card.dataset.productCategory !== category;
            });
            productFilterButtons.forEach(button => {
                const isActive = button.dataset.productFilter === category;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-pressed', String(isActive));
            });
            productsCarousel.scrollLeft = 0;
            requestAnimationFrame(updateProductControls);
        };

        productFilterButtons.forEach(button => {
            button.addEventListener('click', () => {
                applyProductFilter(button.dataset.productFilter);
            });
        });

        pPrevBtn.addEventListener('click', () => {
            productsCarousel.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
        });

        pNextBtn.addEventListener('click', () => {
            productsCarousel.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
        });

        productsCarousel.addEventListener('scroll', updateProductControls, { passive: true });
        window.addEventListener('resize', updateProductControls);
        const initialCategory = document.querySelector('[data-product-filter].is-active')?.dataset.productFilter || 'equipment';
        applyProductFilter(initialCategory);
    }

    /* =========================================
       8. Engineering Records Map
       ========================================= */
    document.querySelectorAll('[data-engineering-records]').forEach(section => {
        const eventButtons = Array.from(section.querySelectorAll('[data-record-event]'));
        const mapStates = Array.from(section.querySelectorAll('[data-record-event-state]'));
        const detailStates = Array.from(section.querySelectorAll('[data-record-detail-state]'));
        const metricDistance = section.querySelector('[data-record-metric-distance]');
        const metricIntensity = section.querySelector('[data-record-metric-intensity]');
        const metricAcceleration = section.querySelector('[data-record-metric-acceleration]');
        const metricMagnitude = section.querySelector('[data-record-metric-magnitude]');
        const eventRail = section.querySelector('.engineering-evidence__rail');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const mobileLayout = window.matchMedia('(max-width: 700px)');
        const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)');
        const committedSites = new Map();
        let activeEventId = '';
        let railFrame = 0;
        let suppressRailSync = false;

        if (eventButtons.length === 0 || mapStates.length === 0) return;

        const getEventMapState = eventId => mapStates.find(state => state.dataset.recordEventState === eventId);
        const getEventDetailState = eventId => detailStates.find(state => state.dataset.recordDetailState === eventId);

        const selectSite = (eventId, siteId, commit = true) => {
            const mapState = getEventMapState(eventId);
            const detailState = getEventDetailState(eventId);
            if (!mapState || !detailState) return;

            if (commit) committedSites.set(eventId, siteId);

            const siteControls = Array.from(section.querySelectorAll(`[data-record-site][data-record-event-owner="${eventId}"]`));
            const selectedControl = siteControls.find(control => control.dataset.recordSite === siteId);
            if (!selectedControl) return;

            siteControls.forEach(control => {
                const selected = control.dataset.recordSite === siteId;
                control.classList.toggle('is-selected', selected);
                control.setAttribute('aria-pressed', String(selected));
            });

            mapState.querySelectorAll('[data-record-site-visual]').forEach(visual => {
                visual.classList.toggle('is-selected', visual.dataset.recordSiteVisual === siteId);
            });

            detailState.querySelectorAll('[data-record-site-detail]').forEach(detail => {
                detail.hidden = detail.dataset.recordSiteDetail !== siteId;
            });

            metricDistance.textContent = `${selectedControl.dataset.distance} km`;
            metricIntensity.textContent = selectedControl.dataset.intensity;
            metricAcceleration.textContent = selectedControl.dataset.acceleration;
        };

        const activateEvent = (eventId, options = {}) => {
            const { scroll = false, animate = true } = options;
            const mapState = getEventMapState(eventId);
            const detailState = getEventDetailState(eventId);
            const eventButton = eventButtons.find(button => button.dataset.recordEvent === eventId);
            if (!mapState || !detailState || !eventButton) return;

            activeEventId = eventId;
            eventButtons.forEach(button => {
                const active = button === eventButton;
                button.classList.toggle('is-active', active);
                button.setAttribute('aria-selected', String(active));
                button.tabIndex = active ? 0 : -1;
            });

            mapStates.forEach(state => {
                state.hidden = state !== mapState;
                state.classList.remove('is-updating');
            });
            detailStates.forEach(state => { state.hidden = state !== detailState; });

            if (animate && !reducedMotion.matches) {
                requestAnimationFrame(() => mapState.classList.add('is-updating'));
                window.setTimeout(() => mapState.classList.remove('is-updating'), 520);
            }

            const selectedSite = committedSites.get(eventId) || mapState.dataset.defaultSite;
            selectSite(eventId, selectedSite, true);
            metricMagnitude.textContent = `M${eventButton.dataset.eventMagnitude}`;

            if (scroll) {
                suppressRailSync = true;
                eventButton.scrollIntoView({
                    behavior: reducedMotion.matches ? 'auto' : 'smooth',
                    block: 'nearest',
                    inline: 'center',
                });
                window.setTimeout(() => { suppressRailSync = false; }, reducedMotion.matches ? 0 : 650);
            }
        };

        eventButtons.forEach((button, index) => {
            button.addEventListener('click', () => activateEvent(button.dataset.recordEvent, { scroll: true }));
            button.addEventListener('keydown', event => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                let nextIndex = index;
                if (event.key === 'ArrowLeft') nextIndex = Math.max(0, index - 1);
                if (event.key === 'ArrowRight') nextIndex = Math.min(eventButtons.length - 1, index + 1);
                if (event.key === 'Home') nextIndex = 0;
                if (event.key === 'End') nextIndex = eventButtons.length - 1;
                const nextButton = eventButtons[nextIndex];
                activateEvent(nextButton.dataset.recordEvent, { scroll: true });
                nextButton.focus();
            });
        });

        section.querySelectorAll('[data-record-site]').forEach(control => {
            const eventId = control.dataset.recordEventOwner;
            const siteId = control.dataset.recordSite;
            control.addEventListener('click', () => selectSite(eventId, siteId, true));
            control.addEventListener('pointerenter', () => {
                if (hoverCapable.matches && eventId === activeEventId) selectSite(eventId, siteId, false);
            });
            control.addEventListener('pointerleave', () => {
                if (!hoverCapable.matches || eventId !== activeEventId) return;
                selectSite(eventId, committedSites.get(eventId) || siteId, false);
            });
        });

        if (eventRail) {
            eventRail.addEventListener('scroll', () => {
                if (!mobileLayout.matches || suppressRailSync) return;
                cancelAnimationFrame(railFrame);
                railFrame = requestAnimationFrame(() => {
                    const railCenter = eventRail.getBoundingClientRect().left + eventRail.clientWidth / 2;
                    const closest = eventButtons.reduce((best, button) => {
                        const rect = button.getBoundingClientRect();
                        const distance = Math.abs(rect.left + rect.width / 2 - railCenter);
                        return !best || distance < best.distance ? { button, distance } : best;
                    }, null);
                    if (closest && closest.button.dataset.recordEvent !== activeEventId) {
                        activateEvent(closest.button.dataset.recordEvent, { scroll: false });
                    }
                });
            }, { passive: true });
        }

        const initialEventId = eventButtons[0].dataset.recordEvent;
        activateEvent(initialEventId, { animate: false });

        if (reducedMotion.matches) {
            section.classList.add('is-demo-complete');
        } else {
            section.classList.add('is-awaiting-demo');
            const demoObserver = new IntersectionObserver(entries => {
                if (!entries.some(entry => entry.isIntersecting)) return;
                section.classList.remove('is-awaiting-demo');
                section.classList.add('is-demoing');
                window.setTimeout(() => {
                    section.classList.remove('is-demoing');
                    section.classList.add('is-demo-complete');
                }, 2050);
                demoObserver.disconnect();
            }, { threshold: 0.3 });
            demoObserver.observe(section);
        }
    });

});
