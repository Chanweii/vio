const languageStorageKey = 'vio-language-position';
const maxLanguageRecordAge = 10_000;

type LanguageRecord = {
  targetPath: string;
  pageProgress: number;
  section: { key?: string; progress: number } | null;
  createdAt: number;
};

function getPageProgress() {
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  return Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
}

function getSectionPosition() {
  const viewportReference = window.innerHeight * 0.35;
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-language-section]'));
  const currentSection = sections.find((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= viewportReference && rect.bottom > viewportReference;
  });

  if (!currentSection) return null;

  const rect = currentSection.getBoundingClientRect();
  const sectionTop = window.scrollY + rect.top;
  const availableDistance = Math.max(rect.height - window.innerHeight, 1);

  return {
    key: currentSection.dataset.languageSection,
    progress: Math.min(Math.max((window.scrollY - sectionTop) / availableDistance, 0), 1),
  };
}

function rememberLanguagePosition(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const link = target.closest<HTMLAnchorElement>('a[data-language-switch]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const targetUrl = new URL(link.href, location.href);
  if (targetUrl.origin !== location.origin) return;
  if (targetUrl.pathname === location.pathname) {
    event.preventDefault();
    return;
  }

  const record: LanguageRecord = {
    targetPath: targetUrl.pathname,
    pageProgress: getPageProgress(),
    section: getSectionPosition(),
    createdAt: Date.now(),
  };
  sessionStorage.setItem(languageStorageKey, JSON.stringify(record));
}

function restoreLanguagePosition() {
  const rawRecord = sessionStorage.getItem(languageStorageKey);
  if (!rawRecord) return;

  try {
    const record = JSON.parse(rawRecord) as LanguageRecord;
    if (Date.now() - record.createdAt > maxLanguageRecordAge || location.pathname !== record.targetPath) {
      sessionStorage.removeItem(languageStorageKey);
      return;
    }

    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    let targetY = record.pageProgress * maxScroll;
    const matchingSection = record.section?.key
      ? document.querySelector<HTMLElement>(`[data-language-section="${record.section.key}"]`)
      : null;

    if (matchingSection && record.section) {
      const rect = matchingSection.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const availableDistance = Math.max(rect.height - window.innerHeight, 0);
      targetY = sectionTop + record.section.progress * availableDistance;
    }

    window.scrollTo({ top: Math.min(Math.max(targetY, 0), maxScroll), left: 0, behavior: 'auto' });
  } catch {
    // Ignore stale navigation data.
  } finally {
    sessionStorage.removeItem(languageStorageKey);
  }
}

function initializeHeader() {
  const header = document.querySelector<HTMLElement>('.header');
  if (!header) return;

  const updateHeader = () => {
    const floating = window.scrollY > 50 || header.hasAttribute('data-solid');
    header.classList.toggle('is-floating', floating);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

function initializeTheme() {
  const root = document.documentElement;
  const systemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const setTheme = (theme: string) => {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('vio-theme', theme);
  };

  setTheme(localStorage.getItem('vio-theme') || systemTheme());
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });
  });
}

function initializeMobileMenu() {
  const button = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const navigation = document.querySelector<HTMLElement>('[data-primary-navigation]');
  if (!button || !navigation) return;

  const setOpen = (open: boolean) => {
    navigation.classList.toggle('active', open);
    button.setAttribute('aria-expanded', String(open));
  };

  button.addEventListener('click', () => setOpen(!navigation.classList.contains('active')));
  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation.classList.contains('active')) {
      setOpen(false);
      button.focus();
    }
  });
  window.matchMedia('(max-width: 1400px)').addEventListener('change', (event) => {
    if (!event.matches) setOpen(false);
  });
}

document.addEventListener('click', rememberLanguagePosition);
initializeHeader();
initializeTheme();
initializeMobileMenu();
requestAnimationFrame(restoreLanguagePosition);
