import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

type SolutionItem = {
  title: string;
  description: string;
  components: string;
  image: string;
};

type ScrollWindow = Window & {
  __vioScrollCleanup?: () => void;
};

function initializeImmersiveScroll() {
  const progressBar = document.querySelector<HTMLElement>('[data-scroll-progress]');
  if (!progressBar) return;

  const scrollWindow = window as ScrollWindow;
  scrollWindow.__vioScrollCleanup?.();

  const lenis = new Lenis({
    autoRaf: true,
    lerp: 0.11,
    wheelMultiplier: 1,
    smoothWheel: true,
    anchors: true,
    stopInertiaOnNavigate: true,
    respectReducedMotion: false,
  });

  let snapPositions: number[] = [];
  let snapActivationPoint = Number.POSITIVE_INFINITY;
  let snapExitPoint = 0;
  let freeScrollStartPoint = Number.POSITIVE_INFINITY;
  let isStepLocked = false;
  let cooldownUntil = 0;
  let lockTimer = 0;
  let resizeTimer = 0;
  let bodyObserver: ResizeObserver | undefined;

  const updateProgress = () => {
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, lenis.progress))})`;
  };

  lenis.on('scroll', updateProgress);
  updateProgress();

  const groups: { content: string; parts?: string; align?: 'center' | 'top' }[] = [
    { content: '.about-section .about-container' },
    { content: '.engineering-section .eng-container', parts: '.engineering-section .eng-header, .engineering-section .process-step' },
    { content: '.solutions-grid', parts: '.solutions-nav-col, .solutions-img-col, .solutions-content-col' },
    { content: '.achievements-section .eng-container', parts: '.achievements-section .eng-header, .achievements-section .achievement-card, .achievements-section .achievements-cta' },
    { content: '.products-section .eng-container' },
    { content: '.clients-section', align: 'top' },
  ];

  const easeSoftStep = (t: number) => {
    const cubicInOut = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const quartOut = 1 - Math.pow(1 - t, 3.6);
    return 0.2 * cubicInOut + 0.8 * quartOut;
  };

  const refreshStops = () => {
    const header = document.querySelector<HTMLElement>('header');
    const rawHeaderHeight = header?.offsetHeight ?? 0;
    const headerHeight = header && !header.classList.contains('is-floating')
      ? Math.max(0, rawHeaderHeight - 16)
      : rawHeaderHeight;
    const availableHeight = Math.max(320, window.innerHeight - headerHeight);
    const maximumContentHeight = availableHeight * 0.92;
    const viewportCenter = headerHeight + availableHeight / 2;
    const scrollLimit = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const targets: { element: HTMLElement; align: 'center' | 'top' }[] = [];

    groups.forEach(({ content, parts, align = 'center' }) => {
      const contentElement = document.querySelector<HTMLElement>(content);
      if (!contentElement) return;

      if (!parts || contentElement.offsetHeight <= maximumContentHeight) {
        targets.push({ element: contentElement, align });
        return;
      }

      const partElements = Array.from(document.querySelectorAll<HTMLElement>(parts));
      const resolved = partElements.length ? partElements : [contentElement];
      resolved.forEach((element) => targets.push({ element, align }));
    });

    snapPositions = targets
      .filter(({ element }) => element.offsetParent !== null)
      .map(({ element, align }) => {
        const rect = element.getBoundingClientRect();
        if (align === 'top') {
          const flushTop = window.scrollY + rect.top - headerHeight;
          return Math.min(scrollLimit, Math.max(0, Math.round(flushTop)));
        }
        if (rect.height > availableHeight * 0.94) {
          const topAligned = window.scrollY + rect.top - headerHeight - 24;
          return Math.min(scrollLimit, Math.max(0, Math.round(topAligned)));
        }
        const targetCenter = window.scrollY + rect.top + rect.height / 2;
        return Math.min(scrollLimit, Math.max(0, Math.round(targetCenter - viewportCenter)));
      })
      .sort((a, b) => a - b)
      .filter((position, index, values) => index === 0 || position - values[index - 1] > 48);

    const firstStop = snapPositions[0] ?? Number.POSITIVE_INFINITY;
    const lastStop = snapPositions[snapPositions.length - 1] ?? Number.POSITIVE_INFINITY;
    snapActivationPoint = Math.max(48, firstStop - availableHeight * 0.65);
    snapExitPoint = 0;
    freeScrollStartPoint = lastStop + availableHeight * 0.35;
  };

  const unlockStep = () => {
    window.clearTimeout(lockTimer);
    cooldownUntil = performance.now() + 140;
    lockTimer = window.setTimeout(() => { isStepLocked = false; }, 140);
  };

  const moveToStop = (position: number) => {
    const distance = Math.abs(position - lenis.scroll);
    if (distance < 2) return;
    const duration = Math.min(0.84, Math.max(0.66, 0.56 + (distance / Math.max(window.innerHeight, 1)) * 0.22));
    isStepLocked = true;
    window.clearTimeout(lockTimer);
    lockTimer = window.setTimeout(() => { isStepLocked = false; }, Math.round(duration * 1000) + 160);
    lenis.scrollTo(position, {
      duration,
      easing: easeSoftStep,
      lock: true,
      force: true,
      onComplete: unlockStep,
    });
  };

  const handleWheel = (event: WheelEvent) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    const direction = Math.sign(event.deltaY);
    const current = lenis.scroll;
    const lastStop = snapPositions[snapPositions.length - 1] ?? Number.POSITIVE_INFINITY;

    if (current < snapActivationPoint) return;
    if (direction > 0 && current >= lastStop - 16) return;
    if (direction < 0 && current > freeScrollStartPoint) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (!direction || Math.abs(event.deltaY) < 6 || isStepLocked || performance.now() < cooldownUntil) return;

    if (direction > 0) {
      const next = snapPositions.find((position) => position > current + 40);
      if (typeof next === 'number') moveToStop(next);
      return;
    }

    const previous = snapPositions.findLast((position) => position < current - 40);
    if (typeof previous === 'number') {
      moveToStop(previous);
      return;
    }

    moveToStop(snapExitPoint);
  };

    const scheduleRefresh = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(refreshStops, 120);
    };

    refreshStops();
    window.addEventListener('wheel', handleWheel, { capture: true, passive: false });
    window.addEventListener('resize', scheduleRefresh);
    window.addEventListener('load', scheduleRefresh, { once: true });

    if ('ResizeObserver' in window) {
      bodyObserver = new ResizeObserver(scheduleRefresh);
      bodyObserver.observe(document.body);
    }

  scrollWindow.__vioScrollCleanup = () => {
    window.clearTimeout(lockTimer);
    window.clearTimeout(resizeTimer);
    window.removeEventListener('wheel', handleWheel, { capture: true });
    window.removeEventListener('resize', scheduleRefresh);
    bodyObserver?.disconnect();
    lenis.destroy();
  };
}

function initializeHeroVideo() {
  const video = document.querySelector<HTMLVideoElement>('#hero-video');
  video?.play().catch(() => {
    // Browsers may pause autoplay until the visitor interacts with the page.
  });
}

function initializeCounters() {
  const counters = document.querySelectorAll<HTMLElement>('.counter[data-target]');
  if (!counters.length) return;

  const showFinalValue = (counter: HTMLElement) => {
    const target = Number(counter.dataset.target ?? 0);
    counter.textContent = target.toLocaleString();
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(showFinalValue);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const counter = entry.target as HTMLElement;
      const target = Number(counter.dataset.target ?? 0);
      observer.unobserve(counter);

      const duration = target < 20 ? 800 : 1200;
      const startValue = target > 2000 ? target - 2000 : 0;
      let startTime: number | undefined;

      const update = (timestamp: number) => {
        startTime ??= timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = progress * (2 - progress);
        if (progress < 1) {
          counter.textContent = Math.floor(startValue + (target - startValue) * eased).toLocaleString();
          requestAnimationFrame(update);
        } else {
          counter.textContent = target.toLocaleString();
        }
      };

      requestAnimationFrame(update);
    });
  }, { threshold: 0.2 });

  counters.forEach((counter) => observer.observe(counter));
}

function initializeSolutions() {
  document.querySelectorAll<HTMLElement>('[data-solutions-slider]').forEach((section) => {
    let items: SolutionItem[] = [];
    try {
      items = JSON.parse(section.dataset.items ?? '[]') as SolutionItem[];
    } catch {
      return;
    }
    if (!items.length) return;

    const tabs = Array.from(section.querySelectorAll<HTMLElement>('[data-solution-tab]'));
    const image = section.querySelector<HTMLImageElement>('[data-solution-image]');
    const title = section.querySelector<HTMLElement>('[data-solution-title]');
    const content = section.querySelector<HTMLElement>('[data-solution-content]');
    const description = section.querySelector<HTMLElement>('[data-solution-description]');
    const components = section.querySelector<HTMLElement>('[data-solution-components]');
    const current = section.querySelector<HTMLElement>('[data-solution-current]');
    const previous = section.querySelector<HTMLButtonElement>('[data-solution-prev]');
    const next = section.querySelector<HTMLButtonElement>('[data-solution-next]');
    if (!image || !title || !content || !description || !components || !current) return;

    let activeIndex = 0;
    let updateTimer = 0;

    const update = (index: number) => {
      activeIndex = (index + items.length) % items.length;
      tabs.forEach((tab, tabIndex) => tab.classList.toggle('active', tabIndex === activeIndex));
      image.style.opacity = '0';
      title.style.opacity = '0';
      content.style.opacity = '0';
      window.clearTimeout(updateTimer);

      updateTimer = window.setTimeout(() => {
        const item = items[activeIndex];
        image.src = item.image;
        image.alt = item.title;
        title.textContent = item.title;
        description.textContent = item.description;
        components.textContent = item.components;
        current.textContent = String(activeIndex + 1).padStart(2, '0');
        image.style.opacity = '1';
        title.style.opacity = '1';
        content.style.opacity = '1';
      }, 300);
    };

    tabs.forEach((tab, index) => tab.addEventListener('click', () => update(index)));
    previous?.addEventListener('click', () => update(activeIndex - 1));
    next?.addEventListener('click', () => update(activeIndex + 1));
  });
}

function initializeProducts() {
  document.querySelectorAll<HTMLElement>('[data-products]').forEach((section) => {
    const carousel = section.querySelector<HTMLElement>('[data-products-carousel]');
    const previous = section.querySelector<HTMLButtonElement>('[data-product-prev]');
    const next = section.querySelector<HTMLButtonElement>('[data-product-next]');
    const filters = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-product-filter]'));
    if (!carousel || !previous || !next) return;

    const cards = Array.from(carousel.querySelectorAll<HTMLElement>('[data-product-category]'));
    const scrollStep = () => {
      const firstVisible = cards.find((card) => !card.hidden) ?? carousel.firstElementChild;
      if (!(firstVisible instanceof HTMLElement)) return carousel.clientWidth;
      return firstVisible.getBoundingClientRect().width + (Number.parseFloat(getComputedStyle(carousel).gap) || 0);
    };

    const updateControls = () => {
      const maximum = carousel.scrollWidth - carousel.clientWidth;
      previous.disabled = carousel.scrollLeft <= 2;
      next.disabled = carousel.scrollLeft >= maximum - 2;
    };

    const applyFilter = (category: string) => {
      cards.forEach((card) => { card.hidden = card.dataset.productCategory !== category; });
      filters.forEach((filter) => {
        const active = filter.dataset.productFilter === category;
        filter.classList.toggle('is-active', active);
        filter.setAttribute('aria-pressed', String(active));
      });
      carousel.scrollLeft = 0;
      requestAnimationFrame(updateControls);
    };

    filters.forEach((filter) => filter.addEventListener('click', () => applyFilter(filter.dataset.productFilter ?? 'equipment')));
    previous.addEventListener('click', () => carousel.scrollBy({ left: -scrollStep(), behavior: 'smooth' }));
    next.addEventListener('click', () => carousel.scrollBy({ left: scrollStep(), behavior: 'smooth' }));
    carousel.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', updateControls);
    applyFilter(filters.find((filter) => filter.classList.contains('is-active'))?.dataset.productFilter ?? 'equipment');
  });
}

initializeImmersiveScroll();
initializeHeroVideo();
initializeCounters();
initializeSolutions();
initializeProducts();
