const siteHeader = document.querySelector('.site-header');
function updateHeaderHeight() {
  document.documentElement.style.setProperty('--header-height', `${siteHeader.getBoundingClientRect().height}px`);
}
new ResizeObserver(updateHeaderHeight).observe(siteHeader);
updateHeaderHeight();

const themeToggle = document.querySelector('.theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let manualTheme = false;
try { manualTheme = ['light', 'dark'].includes(localStorage.getItem('portfolio-theme')); } catch {}

function updateThemeLabel() {
  const label = `Switch to ${document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'} mode`;
  themeToggle.setAttribute('aria-label', label);
  themeToggle.title = label;
}
themeToggle.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  manualTheme = true;
  try { localStorage.setItem('portfolio-theme', theme); } catch {}
  updateThemeLabel();
});
systemTheme.addEventListener('change', event => {
  if (!manualTheme) {
    document.documentElement.dataset.theme = event.matches ? 'dark' : 'light';
    updateThemeLabel();
  }
});
updateThemeLabel();
document.querySelector('#year').textContent = new Date().getFullYear();

// Use the same entrance motion throughout; content remains visible without support.
if ('IntersectionObserver' in window && typeof Element.prototype.animate === 'function') {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (!reducedMotion.matches) {
        entry.target.animate([
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], {
          duration: 450,
          delay: Number(entry.target.dataset.revealDelay || 0),
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'backwards'
        });
      }
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  const revealSelector = '.hero-copy, .profile-card, .section-heading, .experience-card, .project-card, .featured-project, .certificate-card, .approach-row, .contact-panel, .skill-group h3, .skill-list li';
  document.querySelectorAll('.skill-group').forEach(group => {
    group.querySelectorAll('h3, .skill-list li').forEach((item, index) => {
      item.dataset.revealDelay = Math.min(index * 45, 270);
    });
  });
  document.querySelectorAll(revealSelector).forEach(item => revealObserver.observe(item));
  reducedMotion.addEventListener('change', event => {
    if (event.matches) {
      document.querySelectorAll(revealSelector).forEach(item => {
        item.getAnimations().forEach(animation => animation.cancel());
      });
    }
  });
}

const projects = {
  folio: {
    title: 'Personal portfolio',
    description: 'The site you’re exploring: a minimal, responsive portfolio with a calm visual style, light and dark themes, keyboard-accessible navigation, and space for selected work.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    note: 'Focus: clear visual hierarchy, responsive layouts, and accessible interactions.'
  },
  notes: {
    title: 'Everyday notes',
    description: 'A sample product direction for a quieter note-taking experience. A warm paper palette, simple checklists, and thoughtful typography keep the focus on your thoughts.',
    tags: ['Sample concept', 'UI design'],
    note: 'An illustrative UI concept exploring a note-taking experience; not a released application.'
  }
};
const categoryFilters = document.querySelectorAll('[data-category]');
const designCards = document.querySelectorAll('[data-project], [data-design-categories]');
const designGrid = document.querySelector('.project-grid');
const designEmpty = document.querySelector('.design-empty');
const designStatus = document.querySelector('#design-status');
const designPagination = document.createElement('div');
designPagination.className = 'design-pagination';
designPagination.setAttribute('role', 'navigation');
designPagination.setAttribute('aria-label', 'Design pages');
document.querySelector('#design-results').append(designPagination);
const designsPerPage = 1;
let currentPage = 1;
let selectedCategory = 'all';
let selectedLabel = 'All designs';

function renderDesignPage() {
  const matchingCards = [...designCards].filter(card => selectedCategory === 'all' ||
    (card.dataset.designCategories || '').split(' ').includes(selectedCategory));
  const count = matchingCards.length;
  const pageCount = Math.ceil(count / designsPerPage);
  currentPage = Math.min(currentPage, Math.max(1, pageCount));
  const start = (currentPage - 1) * designsPerPage;
  const visibleCards = new Set(matchingCards.slice(start, start + designsPerPage));
  designCards.forEach(card => { card.hidden = !visibleCards.has(card); });
  designGrid.hidden = count === 0;
  designEmpty.hidden = count !== 0;
  document.querySelector('#design-empty-heading').textContent = selectedLabel;
  designStatus.textContent = count
    ? `${selectedLabel} · Showing ${start + 1}–${Math.min(start + designsPerPage, count)} of ${count}`
    : `${selectedLabel} · 0 items`;
  designPagination.replaceChildren();
  designPagination.hidden = pageCount <= 1;
  for (const direction of [-1, 1]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = direction < 0 ? 'Previous' : 'Next';
    button.dataset.direction = direction;
    button.disabled = direction < 0 ? currentPage === 1 : currentPage === pageCount;
    button.setAttribute('aria-controls', 'design-results');
    button.addEventListener('click', () => {
      currentPage += direction;
      renderDesignPage();
      const nextFocus = designPagination.querySelector(`[data-direction="${direction}"]:not(:disabled)`) ||
        designPagination.querySelector('button:not(:disabled)');
      nextFocus?.focus({ preventScroll: true });
    });
    designPagination.append(button);
    if (direction < 0) {
      const pageLabel = document.createElement('span');
      pageLabel.textContent = `${currentPage} / ${pageCount}`;
      pageLabel.setAttribute('aria-label', `Page ${currentPage} of ${pageCount}`);
      designPagination.append(pageLabel);
    }
  }
}

categoryFilters.forEach(filter => {
  filter.addEventListener('click', () => {
    selectedCategory = filter.dataset.category;
    selectedLabel = filter.textContent.trim();
    currentPage = 1;
    categoryFilters.forEach(button => button.setAttribute('aria-pressed', String(button === filter)));
    renderDesignPage();
  });
});
renderDesignPage();

document.querySelectorAll('[data-view-apparel]').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('[data-category="apparel"]').click();
  });
});

const projectsSection = document.querySelector('#projects');
const featuredProjects = [...projectsSection.querySelectorAll('.featured-project')];
if (featuredProjects.length > 1) {
  let currentProject = 0;
  const projectPicker = document.createElement('div');
  projectPicker.className = 'project-picker';
  projectPicker.setAttribute('role', 'group');
  projectPicker.setAttribute('aria-label', 'Choose a project');
  const projectPagination = document.createElement('nav');
  projectPagination.className = 'project-pagination';
  projectPagination.setAttribute('aria-label', 'Browse projects');
  const previous = document.createElement('button');
  previous.type = 'button';
  previous.textContent = 'Previous project';
  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = 'Next project';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  const projectButtons = featuredProjects.map((project, index) => {
    project.id = `featured-project-${index + 1}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = project.querySelector('h3').textContent;
    button.setAttribute('aria-controls', project.id);
    button.addEventListener('click', () => showProject(index));
    projectPicker.append(button);
    return button;
  });
  function showProject(index) {
    currentProject = index;
    featuredProjects.forEach((project, position) => {
      project.hidden = position !== currentProject;
      if (project.hidden) project.querySelector('.project-details').open = false;
      projectButtons[position].setAttribute('aria-pressed', String(position === currentProject));
    });
    previous.disabled = currentProject === 0;
    next.disabled = currentProject === featuredProjects.length - 1;
    status.textContent = `Project ${currentProject + 1} of ${featuredProjects.length}`;
    previous.setAttribute('aria-controls', featuredProjects[currentProject].id);
    next.setAttribute('aria-controls', featuredProjects[currentProject].id);
  }
  for (const [button, direction] of [[previous, -1], [next, 1]]) {
    button.addEventListener('click', () => {
      showProject(currentProject + direction);
      projectButtons[currentProject].focus({ preventScroll: true });
      projectsSection.scrollIntoView({ block: 'start' });
    });
  }
  projectPagination.append(previous, status, next);
  projectsSection.querySelector('.section-heading').after(projectPicker);
  projectsSection.append(projectPagination);
  projectsSection.classList.add('is-paginated');
  showProject(0);
}

const certificatesSection = document.querySelector('#certificates');
const certificateCards = [...certificatesSection.querySelectorAll('.certificate-card')];
if (certificateCards.length > 1) {
  let currentCertificate = 0;
  const pagination = document.createElement('nav');
  pagination.className = 'certificate-pagination';
  pagination.setAttribute('aria-label', 'Browse certificates');
  const previous = document.createElement('button');
  previous.type = 'button';
  previous.textContent = 'Previous';
  previous.setAttribute('aria-label', 'Previous certificate');
  previous.setAttribute('aria-controls', 'certificate-results');
  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = 'Next';
  next.setAttribute('aria-label', 'Next certificate');
  next.setAttribute('aria-controls', 'certificate-results');
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');

  function showCertificate(index) {
    currentCertificate = Math.max(0, Math.min(index, certificateCards.length - 1));
    certificateCards.forEach((card, position) => { card.hidden = position !== currentCertificate; });
    previous.disabled = currentCertificate === 0;
    next.disabled = currentCertificate === certificateCards.length - 1;
    status.textContent = `${currentCertificate + 1} / ${certificateCards.length}`;
    status.setAttribute('aria-label', `Certificate ${currentCertificate + 1} of ${certificateCards.length}: ${certificateCards[currentCertificate].querySelector('h3').textContent}`);
  }

  for (const [button, direction] of [[previous, -1], [next, 1]]) {
    button.addEventListener('click', () => {
      showCertificate(currentCertificate + direction);
      if (button.disabled) (direction > 0 ? previous : next).focus({ preventScroll: true });
    });
  }
  pagination.append(previous, status, next);
  certificatesSection.append(pagination);
  certificatesSection.classList.add('is-paginated');
  showCertificate(0);
}

const dialog = document.querySelector('#project-dialog');
const imageViewer = document.querySelector('#project-image-viewer');
const viewerImage = document.querySelector('#image-viewer-image');
const viewerCaption = document.querySelector('#image-viewer-caption');
const viewerStatus = document.querySelector('#image-viewer-status');
let viewerScreens = [];
let viewerIndex = 0;
let syncViewerGallery = null;

function showViewerImage(index) {
  if (!viewerScreens.length) return;
  viewerIndex = (index + viewerScreens.length) % viewerScreens.length;
  const screen = viewerScreens[viewerIndex];
  const source = screen.querySelector('img');
  viewerImage.src = source.src;
  viewerImage.alt = source.alt;
  viewerCaption.textContent = screen.querySelector('figcaption').textContent;
  viewerStatus.textContent = `${viewerIndex + 1} / ${viewerScreens.length}`;
  viewerStatus.setAttribute('aria-label', `Image ${viewerIndex + 1} of ${viewerScreens.length}: ${viewerCaption.textContent}`);
  syncViewerGallery?.(viewerIndex);
}

imageViewer.querySelector('.image-viewer-back').addEventListener('click', () => showViewerImage(viewerIndex - 1));
imageViewer.querySelector('.image-viewer-next').addEventListener('click', () => showViewerImage(viewerIndex + 1));
imageViewer.querySelector('.image-viewer-close').addEventListener('click', () => imageViewer.close());
imageViewer.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  showViewerImage(viewerIndex + (event.key === 'ArrowLeft' ? -1 : 1));
});
imageViewer.addEventListener('click', event => {
  if (event.target !== imageViewer) return;
  const bounds = imageViewer.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) imageViewer.close();
});
imageViewer.addEventListener('close', () => {
  viewerScreens[viewerIndex]?.querySelector('a').focus({ preventScroll: true });
  viewerScreens = [];
  syncViewerGallery = null;
  viewerImage.removeAttribute('src');
});
document.querySelectorAll('.featured-project').forEach(project => {
  const gallery = project.querySelector('.project-gallery');
  const controls = project.querySelector('.project-gallery-controls');
  if (!gallery || !controls) return;
  const screens = [...gallery.querySelectorAll('.project-screen')];
  if (screens.length < 2) return;
  const status = controls.querySelector('.project-gallery-status');
  let currentImage = 0;

  function showImage(index) {
    currentImage = (index + screens.length) % screens.length;
    screens.forEach((screen, position) => { screen.hidden = position !== currentImage; });
    status.textContent = `${currentImage + 1} / ${screens.length}`;
    status.setAttribute('aria-label', `Image ${currentImage + 1} of ${screens.length}: ${screens[currentImage].querySelector('figcaption').textContent}`);
  }

  controls.querySelector('.gallery-back').addEventListener('click', () => showImage(currentImage - 1));
  controls.querySelector('.gallery-next').addEventListener('click', () => showImage(currentImage + 1));
  screens.forEach((screen, index) => {
    screen.querySelector('a').addEventListener('click', event => {
      event.preventDefault();
      viewerScreens = screens;
      syncViewerGallery = showImage;
      document.querySelector('#image-viewer-title').textContent = project.querySelector('h3').textContent;
      showViewerImage(index);
      imageViewer.showModal();
    });
  });
  gallery.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showImage(currentImage + (event.key === 'ArrowLeft' ? -1 : 1));
    // Keep focus on the visible image when navigating from an image link.
    if (screens.some(screen => screen.contains(document.activeElement))) {
      screens[currentImage].querySelector('a').focus({ preventScroll: true });
    }
  });
  gallery.classList.add('is-carousel');
  gallery.tabIndex = 0;
  gallery.setAttribute('aria-roledescription', 'carousel');
  showImage(0);
  controls.hidden = false;
});

designCards.forEach(card => {
  card.addEventListener('click', event => {
    event.preventDefault();
    const project = projects[card.dataset.project];
    const media = document.querySelector('#dialog-media');
    const sourceImage = card.querySelector('.infographic-preview img');
    const sourceArt = card.querySelector('.project-art');
    media.replaceChildren();
    if (sourceImage) {
      const image = document.createElement('img');
      image.src = sourceImage.src;
      image.alt = sourceImage.alt;
      media.append(image);
    } else if (sourceArt) {
      media.append(sourceArt.cloneNode(true));
    }
    media.hidden = media.childElementCount === 0;
    document.querySelector('#dialog-title').textContent = card.querySelector('h3').textContent;
    const descriptions = [...card.querySelectorAll('.design-description')].map(paragraph => paragraph.textContent.trim()).filter(Boolean);
    if (!descriptions.length && project) descriptions.push(project.description);
    document.querySelector('#dialog-description').replaceChildren(...descriptions.map(description => {
      const paragraph = document.createElement('p');
      paragraph.textContent = description;
      return paragraph;
    }));
    const note = document.querySelector('#dialog-note');
    note.textContent = project?.note || '';
    note.hidden = !note.textContent;
    const tags = project?.tags || [...card.querySelectorAll('.tags span')].map(tag => tag.textContent).filter(tag => tag !== 'View design');
    document.querySelector('#dialog-tags').replaceChildren(...tags.map(tag => {
      const element = document.createElement('span');
      element.textContent = tag;
      return element;
    }));
    dialog.showModal();
    dialog.scrollTop = 0;
  });
});
document.querySelectorAll('.dialog-close, .dialog-done').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => { if (event.target === dialog) {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
}});
