// --- UI Logic & Event Listeners ---

// Note: converter.js is loaded before this file in popup.html, so window.TL_Converter is available.

document.addEventListener('DOMContentLoaded', async () => {

    // Helper: Mode Switching
    const tabRealtime = document.getElementById('tab-realtime');
    const tabFile = document.getElementById('tab-file');
    const panelRealtime = document.getElementById('panel-realtime');
    const panelFile = document.getElementById('panel-file');

    function switchMode(mode) {
        if (mode === 'realtime') {
            tabRealtime.classList.add('active');
            tabFile.classList.remove('active');
            panelRealtime.classList.add('active');
            panelFile.classList.remove('active');
        } else {
            tabRealtime.classList.remove('active');
            tabFile.classList.add('active');
            panelRealtime.classList.remove('active');
            panelFile.classList.add('active');
        }
    }

    tabRealtime.addEventListener('click', () => switchMode('realtime'));
    tabFile.addEventListener('click', () => switchMode('file'));

    // Real-time conversion
    const rtInput = document.getElementById('rt-input');
    const rtOutput = document.getElementById('rt-output');

    rtInput.addEventListener('input', (e) => {
        const text = e.target.value;
        const converted = window.TL_Converter.convertText(text);
        rtOutput.value = converted;
    });

    // AUTO-FILL FROM SELECTION
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => window.getSelection().toString()
            });

            if (results && results[0] && results[0].result) {
                const selectedText = results[0].result;
                if (selectedText.trim().length > 0) {
                    rtInput.value = selectedText;
                    rtInput.dispatchEvent(new Event('input'));
                }
            }
        }
    } catch (e) {
        // console.log("Could not access selection", e);
    }

    // Button Logic
    document.getElementById('btn-paste').addEventListener('click', async () => {
        const btn = document.getElementById('btn-paste');
        uiTriggerFeedback(btn);
        try {
            const text = await navigator.clipboard.readText();
            rtInput.value = text;
            rtInput.dispatchEvent(new Event('input'));
        } catch (err) {
            console.error('Failed to read clipboard: ', err);
        }
    });

    document.getElementById('btn-copy').addEventListener('click', async () => {
        const btn = document.getElementById('btn-copy');
        uiTriggerFeedback(btn);
        try {
            await navigator.clipboard.writeText(rtOutput.value);
            const originalHTML = btn.innerHTML;
            btn.innerHTML = 'Khó͘!'; // Taigi for "Copied!"
            setTimeout(() => btn.innerHTML = originalHTML, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    });

    // File conversion logic
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const outputPreview = document.getElementById('outputPreview');
    const fileOutputSection = document.getElementById('fileOutputSection');
    const btnChooseFile = document.getElementById('btn-choose-file');
    let currentFileOutput = '';

    btnChooseFile.addEventListener('click', () => {
        uiTriggerFeedback(btnChooseFile);
        fileInput.click();
    });

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) processFile(e.target.files[0]);
    });

    function processFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const converted = window.TL_Converter.convertText(content);
            showFileResult(converted);
        };
        reader.readAsText(file);
    }

    function showFileResult(text) {
        currentFileOutput = text;
        outputPreview.value = text.slice(0, 1000) + (text.length > 1000 ? '\n... (truncated for preview)' : '');
        fileOutputSection.style.display = 'block';
    }

    document.getElementById('btn-copy-file').addEventListener('click', async () => {
        if (!currentFileOutput) return;
        const btn = document.getElementById('btn-copy-file');
        uiTriggerFeedback(btn);
        try {
            await navigator.clipboard.writeText(currentFileOutput);
            btn.textContent = 'Khó͘!'; // Taigi for "Copied!"
            setTimeout(() => btn.textContent = 'Khó͘', 2000); // Reset to "Khó͘" (Copy)
        } catch (err) {
            console.error(err);
        }
    });

    document.getElementById('btn-download-file').addEventListener('click', () => {
        if (!currentFileOutput) return;
        uiTriggerFeedback(document.getElementById('btn-download-file'));
        const blob = new Blob([currentFileOutput], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = UI_STRINGS.file.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});
