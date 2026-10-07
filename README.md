# Aliah Rez G. Limanay - Portfolio

A static portfolio for visual design, web projects, skills, work experience, and certificates. Built with HTML, CSS, and JavaScript, with a blush and charcoal palette, light/dark themes, and accessible dialogs and pagination.

## Build for deployment

Requires Node.js 18 or newer. No package installation, backend, environment variables, or secrets are needed.

```sh
npm run check
npm run build
```

The build validates local assets, exact filename case for Linux hosting, internal anchors, duplicate IDs, and JavaScript syntax. It recreates `dist/` with only the files referenced by the website, plus `.nojekyll`. Edit the source files, then rebuild; generated files in `dist/` are overwritten.

## Preview the deployment

With Python installed:

```sh
python -m http.server 3000 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:3000. Review desktop and mobile layouts, light and dark mode, design filters, project and certificate navigation, dialogs, and the contact link.

## Deploy

Upload the **contents of `dist/`** to a static host. `index.html` must be at the site's web root. For a host connected to this repository, set the build command to `npm run build` and the publish/output directory to `dist`. There is no application server or start command.

All website asset URLs are relative, so the site also supports hosting under a subdirectory. No SPA rewrite is required. Google Fonts loads externally; system font fallbacks work if the font request is unavailable.

The included `portfolio-deploy.zip` contains the deployment files at the archive root. Extract it before uploading if your host expects a folder. Recreate the ZIP after changing the source:

```powershell
npm run build
Compress-Archive -Path .\dist\* -DestinationPath .\portfolio-deploy.zip -Force
```

The build and ZIP are local preparation only; these commands do not publish the site. A live URL is needed before adding a canonical URL, sitemap, or absolute social preview image URL.

## Edit content

- `index.html`: portfolio text, skill lists, project details, certificates, and contact email.
- `styles.css`: palette variables, responsive layouts, and visual styling.
- `script.js`: themes, pagination, image viewers, and scroll animations.
- `src/`: portfolio images and certificate PDFs.

The theme follows the device preference until manually selected and saves the choice locally. Animations respect reduced-motion preferences. Image and PDF links remain available when JavaScript is disabled.
