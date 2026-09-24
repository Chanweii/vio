type EvidenceInstance = {
  destroy: () => void;
};

const instances = new Map<HTMLElement, EvidenceInstance>();

const initializeEvidence = (section: HTMLElement) => {
  if (instances.has(section)) return;

  const timeline = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-evidence-event]'));
  const defaultSites = new Map<string, string>();
  let activeEventId = timeline[0]?.dataset.evidenceEvent ?? '';

  section.querySelectorAll<HTMLButtonElement>('[data-evidence-site].is-active').forEach((button) => {
    const owner = button.dataset.evidenceOwner;
    const siteId = button.dataset.evidenceSite;
    if (owner && siteId) defaultSites.set(owner, siteId);
  });

  const activateSite = (eventId: string, siteId: string) => {
    if (!eventId || !siteId) return;
    defaultSites.set(eventId, siteId);

    section.querySelectorAll<HTMLElement>(`[data-evidence-site-panel][data-evidence-owner="${eventId}"]`).forEach((panel) => {
      panel.hidden = panel.dataset.evidenceSitePanel !== siteId;
    });

    section.querySelectorAll<HTMLButtonElement>(`[data-evidence-site][data-evidence-owner="${eventId}"], [data-evidence-map-site][data-evidence-owner="${eventId}"]`).forEach((button) => {
      const active = (button.dataset.evidenceSite ?? button.dataset.evidenceMapSite) === siteId;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    section.querySelectorAll<SVGLineElement>(`[data-evidence-map-line][data-evidence-owner="${eventId}"]`).forEach((line) => {
      line.hidden = line.dataset.evidenceMapLine !== siteId;
    });

    section.querySelectorAll<HTMLElement>(`[data-evidence-map-distance][data-evidence-owner="${eventId}"]`).forEach((label) => {
      label.hidden = label.dataset.evidenceMapDistance !== siteId;
    });
  };

  const activateEvent = (eventId: string) => {
    if (!eventId) return;
    activeEventId = eventId;

    section.querySelectorAll<HTMLElement>('[data-evidence-event-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.evidenceEventPanel !== eventId;
    });

    section.querySelectorAll<HTMLElement>('[data-evidence-map-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.evidenceMapPanel !== eventId;
    });

    timeline.forEach((button) => {
      const active = button.dataset.evidenceEvent === eventId;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const activeSite = defaultSites.get(eventId)
      ?? section.querySelector<HTMLButtonElement>(`[data-evidence-site][data-evidence-owner="${eventId}"]`)?.dataset.evidenceSite
      ?? section.querySelector<HTMLButtonElement>(`[data-evidence-map-site][data-evidence-owner="${eventId}"]`)?.dataset.evidenceMapSite;

    if (activeSite) activateSite(eventId, activeSite);
  };

  timeline.forEach((button, index) => {
    button.addEventListener('click', () => activateEvent(button.dataset.evidenceEvent ?? ''));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowLeft') next = Math.max(0, index - 1);
      if (event.key === 'ArrowRight') next = Math.min(timeline.length - 1, index + 1);
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = timeline.length - 1;
      timeline[next]?.focus();
      activateEvent(timeline[next]?.dataset.evidenceEvent ?? '');
    });
  });

  const siteControls = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-evidence-site], [data-evidence-map-site]'));
  siteControls.forEach((button) => {
    button.addEventListener('click', () => {
      const siteId = button.dataset.evidenceSite ?? button.dataset.evidenceMapSite ?? '';
      activateSite(button.dataset.evidenceOwner ?? activeEventId, siteId);
    });
  });

  activateEvent(activeEventId);
  instances.set(section, {
    destroy: () => {},
  });
};

const initializeAll = () => {
  document.querySelectorAll<HTMLElement>('[data-engineering-evidence]').forEach(initializeEvidence);
};

initializeAll();
document.addEventListener('astro:page-load', initializeAll);
document.addEventListener('astro:before-swap', () => {
  instances.forEach((instance) => instance.destroy());
  instances.clear();
});
