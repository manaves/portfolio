# manaves.github.io/portfolio

The personal site of **María Navarro Paredes** — Bioinformatician and Data Scientist.
Static pages, no build step, no framework, no CDN dependency: what is in this repository is what
is served.

Live: <https://manaves.github.io/portfolio/>

## Deploying

`.github/workflows/pages.yml` runs on every push to `main`: it checks the expected files are
present, stages them into `_site` (excluding `.git` and `.github`), and deploys that directory to
GitHub Pages. Pages must be enabled with **Settings → Pages → Source: GitHub Actions**.

No secrets are required.

## Editing the content

Everything lives in `index.html`. The portrait is `assets/img/maria.jpg`; replace it with your
own square photo (the same filename) and it will slot into the hero.

## Licence

Content © María Navarro Paredes. The webfonts are under the SIL Open Font Licence.
