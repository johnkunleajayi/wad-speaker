# WAD 2026 Attendee Poster Generator

Independent, browser-only React + TypeScript + Vite prototype. No backend, accounts, telemetry or persistence. No deployment has been performed.

## Run locally

Use Node.js 22.12+ (or a supported newer LTS) and npm.

```powershell
cd D:\wad2026-poster
npm ci
npm run dev
```

Open the Local URL printed by Vite, normally http://127.0.0.1:5173. If that port is occupied, Vite selects the next available port. To choose a port explicitly:

```powershell
npm run dev -- --port 5178
```

## Checks

```powershell
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Browser tests use installed Microsoft Edge on Windows, and Playwright Chromium on other platforms. For non-Windows environments run `npx playwright install chromium` once. The browser suite starts its own Vite server on 127.0.0.1:5178 (or reuses a running one). Test artifacts are local under ignored `work/`. No real participant data is used in tests: the image fixture contains geometric stripes and the words PHOTO TEST.

## Product

- Required name and photograph; optional professional title and organization.
- One original template, adapted to square 1080 × 1080, portrait 1080 × 1350 and story 1080 × 1920.
- Photo replacement/removal, drag repositioning, 1–3× zoom and labeled position sliders under Adjust position. Focus the poster and use arrow keys to move the photograph; Shift moves in larger steps. Each format uses the same normalized crop parameters within its own frame.
- Live validation, reduced-motion support, keyboard access, local asset loading, visible render/export errors and retry.
- Compact form and live preview, with portrait selected by default and all three formats available. Generating a poster does not register the participant.
- Download is locked until the form is valid, a photograph is ready and the current render has completed.

## Rendering and privacy

`src/lib/renderer.ts` is the sole poster renderer. It waits for the locally hosted fonts and logo, then draws an exact-resolution bitmap. `PosterPreview` stages asynchronous renders, discards stale results and copies the latest completed bitmap to the visible canvas. Export snapshots that visible bitmap and encodes it as PNG; it does not reconstruct the layout in another renderer. Browser tests decode the downloaded PNG and compare every RGBA channel against the preview for all formats.

JPEG, PNG and WebP uploads are checked for MIME type, magic bytes, file size (12 MiB maximum), decoded dimensions (at least 200 px per side, at most 40 megapixels and 16,384 px per side). Browser decoding applies supported EXIF orientation; a local canvas normalizes pixels and strips source metadata. The working photo is reduced to a maximum 2,400 px long side. Very narrow panoramic photos can look soft when heavily cropped; a well-lit portrait gives the best result. SVG and HTML uploads are rejected.

Original image object URLs are revoked after decoding. Download URLs are revoked after a short grace period and on unmount. Photos and details exist only in component memory and clear on reload. The app sends no participant data over the network, writes no local/session storage, and introduces no analytics. The Vercel header configuration further restricts resources to same-origin assets and local blob/data images. Browser extensions and the user's own download folder are outside the application's control.

## Organization

- `src/config.ts`: all event facts, formats, field limits and participant types.
- `src/lib/brand.ts` and `src/styles.css` `@theme`: verified brand palette used in Canvas and Tailwind/CSS respectively.
- `src/lib/layout.ts`: bounded wrapping, fit-to-width typography and crop geometry.
- `src/lib/images.ts`: local image validation/normalization.
- `src/lib/validation.ts`: participant validation and safe Unicode filenames.
- `src/components/`: accessible fields, photo editor and live canvas.
- `src/test/`: core and component tests.
- `e2e/`: real-browser exports, geometry, responsive/privacy, interaction, accessibility and error recovery tests.
- `vercel.json`: Vite build/output configuration and response headers; ready to deploy only after approval.

## Branding and presentation limits

See BRANDING.md for provenance, verified styling and organizer approvals. The retrieved white logo is a 300 × 206 raster; a higher-resolution approved original is desirable for final production. Official fonts and logos need organizer/licensing approval before public release. The logo links to the official conference website. The visible prototype disclaimer was removed at the requested refinement milestone; the application makes no claim of organizer endorsement.

Automated accessibility checks are useful evidence, not a substitute for assistive-technology user testing. Browser verification in this environment uses Chromium-based Microsoft Edge; real iOS Safari, Android devices, Firefox and screen readers are not certified by these checks.


## Approved premium design iteration

The approved direction is `design-references/premium-design-reference.png`. It is retained unchanged and is not used as a page/poster background or shipped as an application asset. React/CSS recreates the warm split surface, display heading, large preview and compact controls. The official logo files remain intact. The interface pairs the existing General Sans with a system serif display heading; Trophy remains self-hosted and appears in the poster year treatment.

The existing Canvas pipeline now draws layered green geometric planes, a broader gold portrait surround, a responsive cream nameplate, event icons, red/gold folds and an original vector interpretation of a Lagos cable-stayed bridge and waterfront skyline. Each export format has its own portrait geometry. The cream nameplate intentionally overlays the lower photo; names and optional details use bounded, measured text regions and never cover the visible face area above that plate. Very long details shrink within their allotted regions.

Photos retain their original backgrounds. The app performs no AI masking or facial alterations. A well-framed portrait or an organizer-provided transparent portrait gives the closest result to the supplied cutout-style reference. Cropping/zoom is available for other photographs. QA-only sample artwork under ignored `work/` uses a portrait detail from the supplied reference with an explicit Sample Attendee name; it is never a default image, shipped asset or registration confirmation.


## Visual refinement and landmark artwork

`src/lib/artwork.ts` contains the original deterministic atmosphere and waterfront illustration. The illustration studies the twin-tip cable-stayed pylon and cable fans of the Lekki–Ikoyi Link Bridge, the communications crown of Marina's NECOM House, and the green-glass Civic Towers and arched Civic Centre on Victoria Island. See LAGOS-ARTWORK.md for visual research, source links and the distinction between an editorial montage and a geographic panorama. No researched landmark photograph is embedded in application assets or exports.

The metallic portrait rim and subtly shaded nameplate work with ordinary background-retaining photos; image pixels are not filtered or sent to external services. The wider desktop surface now uses viewport-relative poster sizing, with the form's button following the fields. The narrow/mobile workflow remains stacked. Browser tests now also check actual text bounding-box corners against the cream nameplate path, in addition to checking artwork bounds and photo/text separation.
