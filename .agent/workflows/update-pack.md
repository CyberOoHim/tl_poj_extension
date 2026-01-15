---
description: Pack extension and update download URL in index.html
---

// turbo

1. Run pack script to generate new extension zip:

   ```
   .\pack.ps1
   ```

2. **(AI Task)**: Parse the output to get the new zip filename (e.g., `extension_20260113_1300.zip`).

3. Update `zipUrl` in `index.html` under `UI_CONSTANTS.hero` to point to the new zip file:

   ```javascript
   zipUrl: 'packed/extension_YYYYMMDD_HHMM.zip',
   ```

   Replace `YYYYMMDD_HHMM` with the timestamp from step 2.
