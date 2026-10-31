# Branding provenance and organizer review

Research performed on 30 October 2026 before the interface was implemented. Sources were retrieved directly from the official website. The resume pass preserved those assets and research rather than replacing them.

## Verified sources

- Official home page: https://www.westafricadreamin.com/
- Active home stylesheet: https://www.westafricadreamin.com/wp-content/uploads/elementor/css/post-3705.css
- Site-kit stylesheet: https://www.westafricadreamin.com/wp-content/uploads/elementor/css/post-8.css
- Original color logo: https://www.westafricadreamin.com/wp-content/uploads/2024/09/WAD3LDT-e1727362074796.png
- Original white variation: https://www.westafricadreamin.com/wp-content/uploads/2024/09/WAD3LDTW-e1727082571854-300x206.png
- General Sans: https://www.westafricadreamin.com/wp-content/uploads/2024/09/GeneralSans-Variable.ttf
- Trophy: https://www.westafricadreamin.com/wp-content/uploads/2024/09/Trophy.ttf

Public source snapshots remain in ignored `work/official-home.html`, `work/post-3705.css` and `work/post-8.css`. Only selected original logos/fonts are shipped, with no website scripts or trackers.

## Actual observed styling

| Role | Verified HEX | Evidence |
| --- | --- | --- |
| Deep green | #001F01 | Active heading text, dark overlays |
| Green | #149A53 | Primary actions and gradient overlays |
| Red | #DE3133 | Secondary actions, labels and hover states |
| Gold | #F29E07 | Countdown labels and background accents |
| Yellow | #F5CB03 | Icons and highlights |
| White | #FFFFFF | Text and surfaces |

The generic Elementor kit also contains default blue/gray colors. Those are not the active event palette and were not adopted. Tokens are centralized in the CSS `@theme` for Tailwind/UI and mirrored in `src/lib/brand.ts` for the Canvas renderer.

The logo combines a West Africa outline with a distinctive stacked display wordmark. General Sans serves body text and controls; Trophy is the editorial display face. The official site uses green-to-deep-green photographic overlays, gold highlights, uppercase labels, large display headings, and clear hierarchy between theme, date/venue and calls to action.

## Promotional material access

The home page itself supplies the 2026 theme, event facts, registration action and promotional visual context. The linked official LinkedIn company page was inspected; its public feed included Road to WAD 2026 activity but is not a formal brand manual. The linked Instagram page was inaccessible through the research tool. No dedicated downloadable 2026 brand manual or approved attendee-poster source was verified in the accessible page links. No claims are made about inaccessible social artwork.

The brief referred to a Zenith Tech Fair concept reference, but no reference image was attached in this chat. No Zenith artwork was copied. The arched portrait, fine architectural curves, grid, restrained green gradient, cream interface neutral and composition are original prototype design decisions, not claimed official WAD artwork. Supporting neutral/gradient shades are interface/artwork treatments rather than additional asserted official colors.

## Asset integrity and replacements

The downloaded logo PNG files are used intact, keeping their original proportions and transparency. They are not recolored, stretched, cropped, redrawn or reconstructed as text. The white raster is drawn proportionally at 204 px wide and remains below its source width. Replace the files under `public/brand/`, updating their paths in `src/config.ts` if necessary. When changing aspect ratios, update the proportional renderer dimensions rather than stretching a replacement. Fonts are loaded locally and the renderer waits for them before drawing/exporting.

## Approval needed before public production

1. Permission to use the event name, logo variations and visual identity in a public attendee generator.
2. Approved high-resolution white/vector logo originals and any 2026-specific lockup or clear-space rules.
3. Confirmation of licensing/redistribution permissions for the downloaded General Sans and Trophy font files.
4. Organizer review of the proposed poster template and final event/registration copy.

This is an independently developed demonstration. It is not endorsed by, affiliated with or an official registration service of the event organizers. The visible prototype notice was removed at the user-requested visual refinement milestone; no endorsement claim was added.
