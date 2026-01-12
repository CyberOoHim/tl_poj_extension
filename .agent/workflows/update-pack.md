---
description: Pack extension and update download URL in index.html
---

# Update Pack Workflow

This workflow creates a new extension zip package and updates the download URL in the landing page.

## Steps

### Step 1: Run pack.ps1 to generate extension zip

Run the PowerShell packing script to create a new timestamped extension zip:

```powershell
.\pack.ps1
```

This will:

- Create a new `packed/extension_YYYYMMDD_HHMM.zip` file
- Update the stable link at `packed/extension.zip`
- Output the new zip filename in the console

**After running, note the generated filename** (e.g., `extension_20260112_2200.zip`).

### Step 2: Update zipUrl in index.html

Update the `zipUrl` value in `index.html` under `UI_CONSTANTS.hero` to point to the newly created zip file.

Find this line in `index.html` (around line 559):

```javascript
zipUrl: 'packed/extension_XXXXXXXX_XXXX.zip',
```

Replace `XXXXXXXX_XXXX` with the new timestamp from Step 1.

For example, if the pack script created `extension_20260112_2200.zip`, update to:

```javascript
zipUrl: 'packed/extension_20260112_2200.zip',
```