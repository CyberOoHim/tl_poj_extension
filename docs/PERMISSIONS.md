# Permissions Justification

This document explains why **TL -> POJ 隨時轉** requires the permissions listed in `manifest.json`.

---

## Host Permissions: `<all_urls>`

This extension converts Taiwanese Tâi-lô (TL) romanization to Pe̍h-ōe-jī (POJ) on any webpage the user visits. The following core features require access to all sites:

1. **Text Selection Conversion** — Users select text on any webpage to see it converted in the side panel.
2. **Live Page Conversion** — Users can toggle "Live Mode" to convert all TL text on a page in-place.
3. **Text Injection** — Users can paste converted POJ into any input field on any website.
4. **Context Menu Integration** — Right-click options ("Fetch Article", "Convert to POJ") must work on all pages.

Without broad host permissions, users would need to manually grant permission for each site, breaking the seamless UX that makes this tool useful.

---

## Individual Permissions

| Permission | Justification |
|------------|---------------|
| `activeTab` | Access the current tab's content when the user interacts with the extension. |
| `scripting` | Inject content scripts for live page conversion and text injection. |
| `contextMenus` | Provide right-click options for converting selected text or fetching articles. |
| `sidePanel` | Display the main extension UI in Chrome's side panel. |
| `tabs` | Detect tab changes to update context menu states and sync UI. |
| `clipboardRead` | Read clipboard content for the "Paste & Convert" feature in Type mode. |
| `storage` | Save user preferences (dark mode, conversion settings) locally. |
| `webNavigation` | Detect page navigation to reset live conversion state and update UI. |

---

## Privacy Commitment

- **No remote servers.** All text processing happens locally in the browser using JavaScript.
- **No data collection.** We do not collect, store, or transmit any user data.
- **No analytics.** No tracking scripts or telemetry.

For the full privacy policy, see [PRIVACY.md](PRIVACY.md).

---

© 2026 Cyber O͘-hîm ki-tē
