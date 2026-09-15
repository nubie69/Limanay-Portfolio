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
const dialog = document.querySelector('#project-dialog');
document.querySelectorAll('[data-project]').forEach(card => {
  card.addEventListener('click', () => {
    const project = projects[card.dataset.project];
    document.querySelector('#dialog-title').textContent = project.title;
    document.querySelector('#dialog-description').textContent = project.description;
    document.querySelector('#dialog-note').textContent = project.note;
    document.querySelector('#dialog-tags').replaceChildren(...project.tags.map(tag => {
      const element = document.createElement('span');
      element.textContent = tag;
      return element;
    }));
    dialog.showModal();
  });
});
document.querySelectorAll('.dialog-close, .dialog-done').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => { if (event.target === dialog) {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
}});
