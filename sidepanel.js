// --- Side Panel Logic ---

document.addEventListener('DOMContentLoaded', () => {

    // --- Toast Notification Helper ---
    const toastContainer = document.getElementById('toast-container');
    function showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // --- Listen for Fetch Error Messages ---
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'TL_EXTENSION_FETCH_ERROR') {
            if (message.errorType === 'NO_ARTICLE') {
                showToast(UI_STRINGS.messages.toastNoArticle, 'error');
            } else if (message.errorType === 'BLOCKED_SITE') {
                showToast(UI_STRINGS.messages.toastBlockedSite, 'error');
            }
        }

        // Handle clear text request from context menu
        if (message.type === 'CLEAR_TEXT_FIELDS') {
            const activeTab = localStorage.getItem('activeTab');

            if (activeTab === 'tab-scan') {
                // Clear Scan tab
                const scanOutput = document.getElementById('scan-output');
                const scanOutputMarkdown = document.getElementById('scan-output-markdown');
                if (scanOutput) {
                    scanOutput.value = '';
                    localStorage.removeItem('scanOutputVal');
                }
                if (scanOutputMarkdown) {
                    scanOutputMarkdown.innerHTML = '';
                }

                // Clear markdown content state (Scan tab specific)
                if (typeof currentMarkdownContent !== 'undefined') {
                    currentMarkdownContent = '';
                }
                if (typeof currentPlainTextContent !== 'undefined') {
                    currentPlainTextContent = '';
                }

                showToast(UI_STRINGS.messages.toastScanCleared, 'success');
            } else if (activeTab === 'tab-type') {
                // Clear Type tab
                const rtInput = document.getElementById('rt-input');
                const rtOutput = document.getElementById('rt-output');
                if (rtInput) {
                    rtInput.value = '';
                    localStorage.removeItem('rtInputValue');
                }
                if (rtOutput) {
                    rtOutput.value = '';
                    localStorage.removeItem('rtOutputValue');
                }

                showToast(UI_STRINGS.messages.toastTypeCleared, 'success');
            }
        }
    });

    // --- Theme Handling ---
    const themeToggle = document.getElementById('theme-toggle');
    const iconSun = document.querySelector('.icon-sun');
    const iconMoon = document.querySelector('.icon-moon');
    const body = document.body;

    function applyTheme(theme) {
        body.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            iconSun.style.display = 'none';
            iconMoon.style.display = 'block';
        } else {
            iconSun.style.display = 'block';
            iconMoon.style.display = 'none';
        }
        localStorage.setItem('theme', theme);
    }

    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });


    // --- Font Size Adjustment ---
    const btnFontInc = document.getElementById('btn-font-increase');
    const btnFontDec = document.getElementById('btn-font-decrease');
    let currentFontSize = parseFloat(localStorage.getItem('contentFontSize')) || 1.0;

    function applyFontSize(size) {
        document.documentElement.style.setProperty('--content-font-size', `${size}rem`);
        localStorage.setItem('contentFontSize', size);
    }

    // Apply initial
    applyFontSize(currentFontSize);

    if (btnFontInc && btnFontDec) {
        btnFontInc.addEventListener('click', () => {
            currentFontSize = Math.min(currentFontSize + 0.1, 2.0); // Max 2rem
            applyFontSize(currentFontSize.toFixed(1));
        });

        btnFontDec.addEventListener('click', () => {
            currentFontSize = Math.max(currentFontSize - 0.1, 0.6); // Min 0.6rem
            applyFontSize(currentFontSize.toFixed(1));
        });
    }

    // --- Auto-Convert Toggle ---
    const autoConvertToggle = document.getElementById('auto-convert-toggle');
    const autoConvertLabel = document.querySelector('label[for="auto-convert-toggle"].switch-text');
    if (autoConvertLabel) autoConvertLabel.textContent = UI_STRINGS.autoConvert.toggle;

    // Query current state from background
    chrome.runtime.sendMessage({ type: "GET_AUTO_CONVERT_STATE" }, (response) => {
        if (response && autoConvertToggle) {
            autoConvertToggle.checked = response.isAutoConvertMode;
        }
    });

    // Listen for toggle changes
    if (autoConvertToggle) {
        autoConvertToggle.addEventListener('change', async (e) => {
            const enabled = e.target.checked;

            // Update background state
            chrome.runtime.sendMessage({
                type: "SET_AUTO_CONVERT_STATE",
                enabled: enabled
            });

            // Trigger conversion (let background handle tab resolution if needed)
            chrome.runtime.sendMessage({
                type: "TRIGGER_PAGE_CONVERSION",
                action: enabled ? "convert" : "undo"
            });
        });
    }

    // Listen for state changes from background (context menu or other tabs)
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "AUTO_CONVERT_STATE_CHANGED" && autoConvertToggle) {
            autoConvertToggle.checked = message.enabled;
        }
    });

    // --- Nasal Superscript Toggle (N -> ⁿ) ---
    const nasalToggle = document.getElementById('nasal-superscript-toggle');
    const nasalLabel = document.getElementById('lbl-nasal-toggle');
    if (nasalLabel) nasalLabel.textContent = UI_STRINGS.settings.nasalLabel;

    // Initialize global setting (default: true = use ⁿ)
    window.TL_USE_NASAL_SUPERSCRIPT = localStorage.getItem('nasalSuperscript') !== 'false';
    if (nasalToggle) nasalToggle.checked = window.TL_USE_NASAL_SUPERSCRIPT;

    if (nasalToggle) {
        nasalToggle.addEventListener('change', (e) => {
            window.TL_USE_NASAL_SUPERSCRIPT = e.target.checked;
            localStorage.setItem('nasalSuperscript', e.target.checked);
            // Re-trigger conversion on existing input
            const rtInput = document.getElementById('rt-input');
            if (rtInput && rtInput.value) {
                rtInput.dispatchEvent(new Event('input'));
            }
        });
    }



    // --- Tone 6 Caron Toggle (ǎ) ---
    const tone6Toggle = document.getElementById('tone6-toggle');
    const tone6Label = document.getElementById('lbl-tone6-toggle');
    if (tone6Label) tone6Label.textContent = UI_STRINGS.settings.tone6Label;

    window.TL_TONE6_USE_CARON = localStorage.getItem('tone6Caron') === 'true'; // Default false
    if (tone6Toggle) {
        tone6Toggle.checked = window.TL_TONE6_USE_CARON;
        tone6Toggle.addEventListener('change', (e) => {
            window.TL_TONE6_USE_CARON = e.target.checked;
            localStorage.setItem('tone6Caron', e.target.checked);
            const rtInput = document.getElementById('rt-input');
            if (rtInput && rtInput.value) rtInput.dispatchEvent(new Event('input'));
        });
    }

    // --- All Caps Support Toggle ---
    const allCapsToggle = document.getElementById('all-caps-toggle');
    const allCapsLabel = document.getElementById('lbl-allcaps-toggle');
    if (allCapsLabel) allCapsLabel.textContent = UI_STRINGS.settings.allCapsLabel;

    // Default true, unless explicitly set to false
    const storedAllCaps = localStorage.getItem('allCapsSupport');
    window.TL_ALL_CAPS_SUPPORT = storedAllCaps !== 'false';

    if (allCapsToggle) {
        allCapsToggle.checked = window.TL_ALL_CAPS_SUPPORT;
        allCapsToggle.addEventListener('change', (e) => {
            window.TL_ALL_CAPS_SUPPORT = e.target.checked;
            localStorage.setItem('allCapsSupport', e.target.checked);
            const rtInput = document.getElementById('rt-input');
            if (rtInput && rtInput.value) rtInput.dispatchEvent(new Event('input'));
        });
    }

    // --- Run UI Test Button ---
    const btnRunTest = document.getElementById('btn-run-test');
    if (btnRunTest) {
        btnRunTest.addEventListener('click', async () => {
            const rtInput = document.getElementById('rt-input');
            if (!rtInput) return;

            try {
                // Try to fetch test sample from file
                const response = await fetch('docs/test-sample.txt');
                if (response.ok) {
                    const testSample = await response.text();
                    rtInput.value = testSample;
                } else {
                    // Fallback to hardcoded sample in ui_config.js
                    rtInput.value = UI_STRINGS.testSample;
                }
            } catch (error) {
                console.error('Error loading test sample:', error);
                // Fallback to hardcoded sample
                rtInput.value = UI_STRINGS.testSample;
            }

            switchTab('tab-type');
            rtInput.dispatchEvent(new Event('input')); // Trigger conversion
        });
    }

    // --- Include URLs Toggle (for Markdown output) ---
    const includeUrlsToggle = document.getElementById('include-urls-toggle');
    // Default: true (include URLs)
    const savedIncludeUrls = localStorage.getItem('includeUrlsInMarkdown') !== 'false';
    if (includeUrlsToggle) {
        includeUrlsToggle.checked = savedIncludeUrls;
        includeUrlsToggle.addEventListener('change', (e) => {
            localStorage.setItem('includeUrlsInMarkdown', e.target.checked);
            // Live update: refresh the markdown display if currently showing
            if (typeof updateMarkdownDisplay === 'function') {
                updateMarkdownDisplay();
            }
        });
    }

    // --- Show Raw Markdown Toggle (raw vs rendered) ---
    const renderMdToggle = document.getElementById('render-md-toggle');
    // Default: false (show rendered markdown, not raw)
    const savedShowRawMd = localStorage.getItem('showRawMarkdown') === 'true';
    if (renderMdToggle) {
        renderMdToggle.checked = savedShowRawMd;
        renderMdToggle.addEventListener('change', (e) => {
            localStorage.setItem('showRawMarkdown', e.target.checked);
            // Live update: refresh the markdown display if currently showing
            if (typeof updateMarkdownDisplay === 'function') {
                updateMarkdownDisplay();
            }
        });
    }

    // --- Reset Settings Button ---
    const btnResetSettings = document.getElementById('btn-reset-settings');
    if (btnResetSettings) {
        btnResetSettings.addEventListener('click', () => {
            // Restore Defaults
            window.TL_USE_NASAL_SUPERSCRIPT = true;
            window.TL_TONE6_USE_CARON = false;
            window.TL_ALL_CAPS_SUPPORT = true;

            // Clear Storage (or set to defaults)
            localStorage.setItem('useNasalSuperscript', 'true');
            localStorage.setItem('tone6UseCaron', 'false');
            localStorage.setItem('allCapsSupport', 'true');
            localStorage.setItem('includeUrlsInMarkdown', 'true');
            localStorage.setItem('showRawMarkdown', 'false');

            // Update UI
            if (nasalToggle) nasalToggle.checked = true;
            if (tone6Toggle) tone6Toggle.checked = false;
            if (allCapsToggle) allCapsToggle.checked = true;
            if (includeUrlsToggle) includeUrlsToggle.checked = true;
            if (renderMdToggle) renderMdToggle.checked = false;

            // Trigger Reconversion
            const rtInput = document.getElementById('rt-input');
            if (rtInput && rtInput.value) rtInput.dispatchEvent(new Event('input'));
        });
    }

    // --- Tab Switching ---
    const modeTabs = {
        'tab-scan': 'panel-scan',
        'tab-type': 'panel-type',
        'tab-file': 'panel-file',
        'tab-help': 'panel-help'
    };

    // Flag and State for Help Content
    let currentHelpLang = 'taigi'; // 'taigi' | 'english'
    let helpContentLoaded = false;

    // Function to load and render HELP.md
    async function loadHelpContent(forceReload = false) {
        if (helpContentLoaded && !forceReload) return;

        const helpContainer = document.getElementById('help-markdown-content');
        if (!helpContainer) return;

        // Update button text
        const btnHelpLang = document.getElementById('btn-help-lang');
        if (btnHelpLang) {
            btnHelpLang.textContent = currentHelpLang === 'taigi' ? 'English' : '台語';
        }

        const filename = currentHelpLang === 'taigi' ? 'docs/HELP.md' : 'docs/HELP.en.md';

        try {
            const response = await fetch(filename);
            if (!response.ok) throw new Error(`Failed to load ${filename}`);

            const markdown = await response.text();

            // Render the markdown
            helpContainer.innerHTML = renderSimpleMarkdown(markdown);
            helpContentLoaded = true;
        } catch (error) {
            console.error('Error loading help content:', error);
            helpContainer.innerHTML = `
                <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">
                    載入說明失敗。<br>
                    Failed to load help content.<br>
                    <small>${error.message}</small>
                </p>
            `;
        }
    }

    // Toggle Help Language
    const btnHelpLang = document.getElementById('btn-help-lang');
    if (btnHelpLang) {
        btnHelpLang.addEventListener('click', () => {
            currentHelpLang = currentHelpLang === 'taigi' ? 'english' : 'taigi';
            loadHelpContent(true);
        });
    }

    function switchTab(activeTabId) {
        // ... (rest of function same, just need context)
        // Save state
        localStorage.setItem('activeTab', activeTabId);

        // Update header buttons
        Object.keys(modeTabs).forEach(tabId => {
            const el = document.getElementById(tabId);
            if (tabId === activeTabId) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        // Update panels
        Object.values(modeTabs).forEach(panelId => {
            const el = document.getElementById(panelId);
            if (panelId === modeTabs[activeTabId]) {
                el.classList.add('active');
                if (panelId === 'panel-file' && document.getElementById('outputPreview').value) {
                    document.getElementById('fileOutputSection').style.display = 'flex';
                }
                // Load help content when help tab is activated
                if (panelId === 'panel-help') {
                    loadHelpContent();
                }
            } else {
                el.classList.remove('active');
            }
        });

        // Notify background to enable/disable clear-text menu
        // Only enabled in Scan and Type modes
        const clearTextEnabled = activeTabId === 'tab-scan' || activeTabId === 'tab-type';
        chrome.runtime.sendMessage({
            type: "UPDATE_CLEAR_TEXT_STATE",
            enabled: clearTextEnabled
        }).catch(() => { });
    }

    Object.keys(modeTabs).forEach(tabId => {
        document.getElementById(tabId).addEventListener('click', () => switchTab(tabId));
    });

    // Restore Key Tab
    const savedTab = localStorage.getItem('activeTab') || 'tab-scan';
    switchTab(savedTab);

    // --- Helper: Download Text ---
    function downloadText(text, filename = 'poj_output.txt') {
        if (!text) return;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // --- Mode 1: SCAN ---
    const scanOutput = document.getElementById('scan-output');
    const scanOutputMarkdown = document.getElementById('scan-output-markdown');
    const btnCopyScan = document.getElementById('btn-copy-scan');
    const btnDownloadScan = document.getElementById('btn-download-scan');

    // Store both markdown and plain text versions
    let currentMarkdownContent = '';
    let currentPlainTextContent = '';

    // Persistence for Scan Output
    const savedScanOutput = localStorage.getItem('scanOutputVal');
    if (savedScanOutput) {
        scanOutput.value = savedScanOutput;
    }

    // Helper to update scan output display
    function setScanOutput(text) {
        scanOutput.value = text;
        localStorage.setItem('scanOutputVal', text);
    }

    // --- Markdown Display Toggle ---
    const markdownDisplayToggle = document.getElementById('markdown-display-toggle');

    // Load saved state (default to FALSE = plain text)
    const savedMarkdownDisplay = localStorage.getItem('markdownDisplayToggle') === 'true';
    if (markdownDisplayToggle) markdownDisplayToggle.checked = savedMarkdownDisplay;

    // Helper to strip URLs from markdown content (preserves source URL)
    function stripUrlsFromMarkdown(md) {
        if (!md) return '';

        // Get localized strings for matching
        const mdStrings = (typeof UI_STRINGS !== 'undefined' && UI_STRINGS.markdown) ? UI_STRINGS.markdown : {
            sourceLabel: 'Source',
            imagesHeader: '🖼️ Images',
            videosHeader: '🎬 Videos',
            audioHeader: '🔊 Audio',
            embedHeader: '📺 Embedded Content',
            imageLabel: 'Image',
            videoLabel: 'Video',
            audioLabel: 'Audio',
            embedLabel: 'Embedded content'
        };

        // Extract and preserve the source URL line (sourceLabel: ...)
        const sourcePattern = new RegExp(`\\n---\\n${mdStrings.sourceLabel}: .+$`);
        const sourceMatch = md.match(sourcePattern);
        const sourceLine = sourceMatch ? sourceMatch[0] : '';

        // Remove source line temporarily for processing
        let processed = sourceLine ? md.replace(sourceLine, '') : md;

        // Escape special regex characters in headers
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        processed = processed
            // Remove markdown images: ![alt](url) -> alt
            .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
            // Replace markdown links: [text](url) -> text
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            // Remove standalone URLs (but not the source line which was already extracted)
            .replace(/(https?|ftp):\/\/[^\s)\]]+/g, '')
            // Remove media sections that only contain URLs (using localized headers)
            .replace(new RegExp(`\\n+---\\n+### ${escapeRegex(mdStrings.imagesHeader)}\\n+(?:- .*\\n?)*`, 'g'), '')
            .replace(new RegExp(`\\n+### ${escapeRegex(mdStrings.videosHeader)}\\n+(?:- .*\\n?)*`, 'g'), '')
            .replace(new RegExp(`\\n+### ${escapeRegex(mdStrings.audioHeader)}\\n+(?:- .*\\n?)*`, 'g'), '')
            .replace(new RegExp(`\\n+### ${escapeRegex(mdStrings.embedHeader)}\\n+(?:- .*\\n?)*`, 'g'), '')
            // Clean up extra blank lines
            .replace(/\n{3,}/g, '\n\n');

        // Re-append the source URL line
        return processed + sourceLine;
    }

    // Get markdown content respecting URL toggle setting
    function getProcessedMarkdown() {
        const includeUrls = localStorage.getItem('includeUrlsInMarkdown') !== 'false';
        if (includeUrls) {
            return currentMarkdownContent;
        } else {
            return stripUrlsFromMarkdown(currentMarkdownContent);
        }
    }

    // Update display based on toggle
    function updateMarkdownDisplay() {
        const showMarkdown = markdownDisplayToggle && markdownDisplayToggle.checked;
        const showRaw = localStorage.getItem('showRawMarkdown') === 'true';

        if (showMarkdown && currentMarkdownContent) {
            if (showRaw) {
                // Show raw markdown in textarea
                scanOutput.style.display = 'block';
                scanOutputMarkdown.style.display = 'none';
                scanOutput.value = getProcessedMarkdown();
                localStorage.setItem('scanOutputVal', scanOutput.value);
            } else {
                // Show rendered markdown view (HTML) - default
                scanOutput.style.display = 'none';
                scanOutputMarkdown.style.display = 'block';
                scanOutputMarkdown.innerHTML = renderSimpleMarkdown(getProcessedMarkdown());
            }
        } else {
            // Show plain textarea (non-markdown content)
            scanOutput.style.display = 'block';
            if (scanOutputMarkdown) scanOutputMarkdown.style.display = 'none';
        }
    }

    // Simple markdown renderer (for display only)
    function renderSimpleMarkdown(md) {
        if (!md) return '';

        // Escape HTML
        let html = md
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Split into lines for processing
        const lines = html.split('\n');
        const result = [];
        let inList = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const trimmed = line.trim();

            // Skip empty lines
            if (!trimmed) {
                if (inList) {
                    result.push('</ul>');
                    inList = false;
                }
                continue;
            }

            // Headings
            if (trimmed.startsWith('### ')) {
                if (inList) { result.push('</ul>'); inList = false; }
                result.push(`<h4 style="margin-top: 1rem; margin-bottom: 0.5rem;">${trimmed.substring(4)}</h4>`);
            } else if (trimmed.startsWith('## ')) {
                if (inList) { result.push('</ul>'); inList = false; }
                result.push(`<h3 style="margin-top: 1.2rem; margin-bottom: 0.5rem;">${trimmed.substring(3)}</h3>`);
            } else if (trimmed.startsWith('# ')) {
                if (inList) { result.push('</ul>'); inList = false; }
                result.push(`<h2 style="margin-top: 1.5rem; margin-bottom: 0.5rem;">${trimmed.substring(2)}</h2>`);
            }
            // Horizontal rule
            else if (trimmed === '---') {
                if (inList) { result.push('</ul>'); inList = false; }
                result.push('<hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--border-color);">');
            }
            // List items
            else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                if (!inList) {
                    result.push('<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">');
                    inList = true;
                }
                let content = trimmed.substring(2);
                // Check for indented sub-items (start with spaces)
                const indent = line.match(/^(\s+)/);
                const indentLevel = indent ? Math.floor(indent[1].length / 2) : 0;
                const marginLeft = indentLevel > 0 ? `margin-left: ${indentLevel}rem;` : '';
                result.push(`<li style="margin: 0.25rem 0; ${marginLeft}">${content}</li>`);
            }
            // Regular paragraph text
            else {
                if (inList) { result.push('</ul>'); inList = false; }
                result.push(`<p style="margin: 0.5rem 0;">${trimmed}</p>`);
            }
        }

        // Close any open list
        if (inList) {
            result.push('</ul>');
        }

        // Join and process inline formatting
        html = result.join('\n')
            // Markdown images: ![alt](url) -> clickable image link
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="md-image-link">🖼️ $1</a>')
            // Markdown links: [text](url) -> clickable link
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
            // Standalone URLs (not already in a link)
            .replace(/(^|[^"'<>])(https?:\/\/[^\s<>"'\]]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>')
            // Bold and italic
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>');

        return html;
    }

    if (markdownDisplayToggle) {
        markdownDisplayToggle.addEventListener('change', (e) => {
            localStorage.setItem('markdownDisplayToggle', e.target.checked);
            updateMarkdownDisplay();
        });
    }

    // Initial display update
    updateMarkdownDisplay();

    // AUTO-FILL FROM SELECTION (on load)
    // Apply UI Strings for Switch
    const enableConversionSwitch = document.getElementById('scan-enable-conversion');
    const enableConversionLabel = document.querySelector('label[for="scan-enable-conversion"].switch-text');
    if (enableConversionLabel) enableConversionLabel.textContent = UI_STRINGS.scan.enableConversion;

    // Load saved state (default to TRUE = enabled)
    const savedEnableConversion = localStorage.getItem('scanEnableConversion') !== 'false';
    if (enableConversionSwitch) enableConversionSwitch.checked = savedEnableConversion;

    // Listen for switch changes
    if (enableConversionSwitch) {
        enableConversionSwitch.addEventListener('change', (e) => {
            localStorage.setItem('scanEnableConversion', e.target.checked);
            // Re-trigger update if we have content
            if (lastReceivedText) {
                if (e.target.checked) {
                    setScanOutput(window.TL_Converter.convertText(lastReceivedText));
                } else {
                    setScanOutput(lastReceivedText);
                }
            }
        });
    }

    let lastReceivedText = '';

    // --- Retry Logic with Exponential Backoff ---
    async function requestSelectionWithRetry(tabId, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await chrome.tabs.sendMessage(tabId, {
                    type: "TL_EXTENSION_REQUEST_SELECTION"
                });
                if (response?.selection !== undefined) return response;
            } catch (e) {
                // console.log(`Selection request attempt ${i + 1} failed:`, e.message);

                // Re-inject content scripts
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId },
                        func: () => { window.TL_CS_Injected = undefined; } // Reset flag
                    });
                    await chrome.scripting.executeScript({
                        target: { tabId },
                        files: ['ui_config.js', 'converter.js', 'content_script.js']
                    });
                } catch (injectErr) {
                    // console.log("Re-injection failed:", injectErr.message);
                }

                // Wait with exponential backoff (100ms, 200ms, 400ms)
                await new Promise(r => setTimeout(r, 100 * Math.pow(2, i)));
            }
        }
        return null;
    }

    // --- Helper to update scan output ---
    function updateScanWithSelection(selection, isArticle = false) {
        if (!selection || selection.length === 0) return;

        lastReceivedText = selection;
        const scanLabel = document.querySelector('#panel-scan label');
        if (scanLabel) {
            scanLabel.textContent = isArticle
                ? UI_STRINGS.scan.statusFetched
                : UI_STRINGS.scan.statusSelected;
        }

        if (enableConversionSwitch && enableConversionSwitch.checked) {
            setScanOutput(window.TL_Converter.convertText(lastReceivedText));
        } else {
            setScanOutput(lastReceivedText);
        }
    }

    // AUTO-FILL FROM SELECTION (on load) with retry
    (async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

            if (!tab?.id || tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://') ||
                tab.url?.startsWith('chrome-extension://') || tab.url?.startsWith('about:')) {
                // console.log('Cannot script this tab:', tab?.url);
                return;
            }

            // Try with retry logic
            const response = await requestSelectionWithRetry(tab.id);
            if (response?.selection) {
                updateScanWithSelection(response.selection);
                return;
            }

            // Final fallback: Direct script execution
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => window.getSelection().toString()
            });

            if (results?.[0]?.result) {
                const selectedText = results[0].result.trim();
                if (selectedText.length > 0) {
                    updateScanWithSelection(selectedText);
                }
            }
        } catch (e) {
            console.error("Auto-fill selection failed:", e);
        }
    })();

    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'TL_EXTENSION_SELECTION_UPDATE') {
            const text = message.text;
            const scanLabel = document.querySelector('#panel-scan label');

            if (!text || text.length === 0) {
                if (scanLabel) scanLabel.textContent = UI_STRINGS.scan.label;
            } else {
                lastReceivedText = text;

                // Store both markdown and plain text if available (from article fetch)
                if (message.markdown) {
                    currentMarkdownContent = message.markdown;
                    currentPlainTextContent = message.plainText || text;
                } else {
                    // Normal selection - no markdown available
                    currentMarkdownContent = '';
                    currentPlainTextContent = text;
                }

                // Update label based on source type
                if (scanLabel) {
                    if (message.title || message.isArticle) {
                        // Fetch Article case
                        scanLabel.textContent = UI_STRINGS.scan.statusFetched;
                    } else {
                        // Normal Selection case
                        scanLabel.textContent = UI_STRINGS.scan.statusSelected;
                    }
                }

                // Apply conversion if enabled
                let displayText = currentPlainTextContent;
                if (enableConversionSwitch && enableConversionSwitch.checked) {
                    displayText = window.TL_Converter.convertText(currentPlainTextContent);
                    // Also convert markdown if we have it
                    if (currentMarkdownContent) {
                        currentMarkdownContent = window.TL_Converter.convertText(message.markdown);
                    }
                }
                setScanOutput(displayText);

                // Update markdown display
                updateMarkdownDisplay();
            }
        }
    });

    // --- Tab Activation Listener ---
    // Refresh selection when user switches to a different tab
    chrome.tabs.onActivated.addListener(async ({ tabId }) => {
        try {
            const tab = await chrome.tabs.get(tabId);
            if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://') ||
                tab.url?.startsWith('chrome-extension://') || tab.url?.startsWith('about:')) {
                return; // Restricted tab
            }

            const response = await requestSelectionWithRetry(tabId);
            if (response?.selection) {
                updateScanWithSelection(response.selection);
            }
        } catch (e) {
            // console.log('Tab activation handler:', e.message);
        }
    });

    btnCopyScan.addEventListener('click', async () => {
        // Copy follows the display toggle state
        const showMarkdown = markdownDisplayToggle && markdownDisplayToggle.checked;

        let textToCopy;
        if (showMarkdown && currentMarkdownContent) {
            // Copy processed markdown (respects URL toggle)
            textToCopy = getProcessedMarkdown();
        } else {
            // Copy plain text (from textarea)
            textToCopy = scanOutput.value || currentPlainTextContent;
        }

        if (textToCopy) {
            uiTriggerFeedback(btnCopyScan);
            await navigator.clipboard.writeText(textToCopy);
            const original = btnCopyScan.textContent;
            btnCopyScan.textContent = 'Khó͘!'; // Taigi
            setTimeout(() => btnCopyScan.textContent = original, 1500);
        }
    });

    btnDownloadScan.addEventListener('click', () => {
        // Download follows the display toggle state
        const showMarkdown = markdownDisplayToggle && markdownDisplayToggle.checked;

        let textToDownload;
        let filename = UI_STRINGS.scan.filename;

        if (showMarkdown && currentMarkdownContent) {
            // Download processed markdown (respects URL toggle)
            textToDownload = getProcessedMarkdown();
            filename = filename.replace('.txt', '.md');
        } else {
            textToDownload = scanOutput.value || currentPlainTextContent;
        }

        uiTriggerFeedback(btnDownloadScan);
        downloadText(textToDownload, filename);
    });

    // --- Mode 2: TYPE ---
    const rtInput = document.getElementById('rt-input');
    const rtOutput = document.getElementById('rt-output');
    const btnDownloadType = document.getElementById('btn-download-type');

    // Persistence for Type Mode
    if (localStorage.getItem('rtInputValue')) {
        rtInput.value = localStorage.getItem('rtInputValue');
    }
    if (localStorage.getItem('rtOutputValue')) {
        rtOutput.value = localStorage.getItem('rtOutputValue');
    }

    rtInput.addEventListener('input', (e) => {
        const text = e.target.value;
        localStorage.setItem('rtInputValue', text); // Save Input

        const converted = window.TL_Converter.convertText(text);
        rtOutput.value = converted;
        localStorage.setItem('rtOutputValue', converted); // Save Output
    });

    document.getElementById('btn-paste').addEventListener('click', async () => {
        uiTriggerFeedback(document.getElementById('btn-paste'));
        try {
            const text = await navigator.clipboard.readText();
            rtInput.value = text;
            rtInput.dispatchEvent(new Event('input'));
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            alert(UI_STRINGS.messages.clipboardError);
            // Fallback: try to just focus and maybe user can paste?
            rtInput.focus();
        }
    });

    document.getElementById('btn-clear-input').addEventListener('click', () => {
        uiTriggerFeedback(document.getElementById('btn-clear-input'));
        rtInput.value = '';
        rtInput.dispatchEvent(new Event('input')); // Trigger update to clear output
        rtInput.focus();
    });

    document.getElementById('btn-copy').addEventListener('click', async () => {
        uiTriggerFeedback(document.getElementById('btn-copy'));
        await navigator.clipboard.writeText(rtOutput.value);
    });

    // --- Inject Button Logic ---
    const btnInject = document.getElementById('btn-inject');
    btnInject.addEventListener('click', async () => {
        const text = rtOutput.value;
        if (!text) return;

        uiTriggerFeedback(btnInject);
        const originalText = btnInject.textContent;
        btnInject.disabled = true;

        try {
            const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

            // Check for restricted pages
            if (!tab || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
                btnInject.textContent = UI_STRINGS.type.injectRestricted;
                setTimeout(() => {
                    btnInject.textContent = originalText;
                    btnInject.disabled = false;
                }, 2000);
                return;
            }

            // Send injection message with robust fallback
            let response;
            try {
                // First try: simple message
                response = await chrome.tabs.sendMessage(tab.id, { type: 'INJECT_TEXT', text: text });
            } catch (err) {
                // If failed, likely because content script isn't there (page opened before extension)
                // console.log("Injection failed, attempting to re-inject content script...", err);

                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content_script.js']
                    });

                    // Small delay to let script initialize
                    await new Promise(r => setTimeout(r, 100));

                    // Second try: message again
                    response = await chrome.tabs.sendMessage(tab.id, { type: 'INJECT_TEXT', text: text });

                } catch (retryErr) {
                    console.error("Retry injection failed:", retryErr);
                    // Show error feedback
                    throw retryErr;
                }
            }

            if (response && response.success) {
                btnInject.textContent = UI_STRINGS.type.injectSuccess;
                btnInject.style.background = "#28a745"; // Success Green
                btnInject.style.color = "white";
            } else {
                btnInject.textContent = UI_STRINGS.type.injectNoTarget;
                btnInject.style.background = "#dc3545"; // Error Red
                btnInject.style.color = "white";
            }

        } catch (e) {
            console.error(e);
            btnInject.textContent = UI_STRINGS.type.injectError;
            btnInject.style.background = "#dc3545";
            btnInject.style.color = "white";
        }

        // Restore button state
        setTimeout(() => {
            btnInject.textContent = originalText;
            btnInject.style.background = "";
            btnInject.style.color = "";
            btnInject.disabled = false;
        }, 1500);
    });

    btnDownloadType.addEventListener('click', () => {
        uiTriggerFeedback(btnDownloadType);
        downloadText(rtOutput.value, UI_STRINGS.type.filename);
    });

    // --- Mode 3: FILE ---
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const outputPreview = document.getElementById('outputPreview');
    const fileOutputSection = document.getElementById('fileOutputSection');
    const btnChooseFile = document.getElementById('btn-choose-file');
    let currentFileOutput = '';

    btnChooseFile.addEventListener('click', (e) => {
        e.stopPropagation();
        uiTriggerFeedback(btnChooseFile);
        fileInput.click();
    });
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('drag-over'); });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) processFile(e.target.files[0]);
    });

    // CSV Logic Variables
    let currentCsvData = null; // { headers: [], rows: [] } (rows is array of objects or array of arrays?) -> Array of objects is easier for col selection
    let currentCsvSeparator = ',';

    // Elements
    const csvOptions = document.getElementById('csv-options');
    const csvColumnsList = document.getElementById('csv-columns-list');
    const btnConvertCsv = document.getElementById('btn-convert-csv');

    // CSV Select All / Deselect All
    document.getElementById('btn-csv-select-all')?.addEventListener('click', () => {
        csvColumnsList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
    });
    document.getElementById('btn-csv-deselect-all')?.addEventListener('click', () => {
        csvColumnsList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    });

    // JSON Select All / Deselect All
    const jsonKeysList = document.getElementById('json-keys-list');
    document.getElementById('btn-json-select-all')?.addEventListener('click', () => {
        jsonKeysList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
    });
    document.getElementById('btn-json-deselect-all')?.addEventListener('click', () => {
        jsonKeysList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    });

    // Helper: Render Table
    function renderTable(headers, rows) {
        const table = document.createElement('table');
        table.id = 'csv-preview-table';

        // Header
        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');
        headers.forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        rows.slice(0, 100).forEach(row => { // limit preview rows for perf
            const tr = document.createElement('tr');
            headers.forEach(h => {
                const td = document.createElement('td');
                td.textContent = row[h];
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        return table;
    }

    // Helper: Parse CSV/TSV
    function parseCSV(text, separator) {
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) return null;

        const headers = lines[0].split(separator).map(h => h.trim());
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(separator);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((h, index) => {
                    row[h] = values[index];
                });
                rows.push(row);
            }
        }
        return { headers, rows, rawLines: lines };
    }

    // Helper: Generate CSV
    function generateCSV(headers, rows, separator) {
        const headerLine = headers.join(separator);
        const dataLines = rows.map(row => {
            return headers.map(h => row[h] || '').join(separator);
        }).join('\n');
        return headerLine + '\n' + dataLines;
    }

    let currentFileName = 'poj_output.txt'; // Default filename

    // Reset Helper
    function resetFileView() {
        const expander = document.getElementById('file-upload-expander');
        if (expander) expander.open = true; // Re-open expander
        const csvExpander = document.getElementById('csv-options-expander');
        if (csvExpander) csvExpander.style.display = 'none';
        const jsonExpander = document.getElementById('json-options-expander');
        if (jsonExpander) jsonExpander.style.display = 'none';
        const subtitleExpander = document.getElementById('subtitle-options-expander');
        if (subtitleExpander) subtitleExpander.style.display = 'none';
        fileOutputSection.style.display = 'none';
        currentCsvData = null;
        currentJsonData = null;
        currentJsonPaths = [];
        currentSubtitleData = null;
        fileInput.value = '';
        currentFileOutput = '';
    }

    // Reset Buttons Logic
    document.getElementById('btn-reset-csv').addEventListener('click', () => {
        uiTriggerFeedback(document.getElementById('btn-reset-csv'));
        resetFileView();
    });

    document.getElementById('btn-reset-file').addEventListener('click', () => {
        uiTriggerFeedback(document.getElementById('btn-reset-file'));
        resetFileView();
    });

    // Smart detection for subtitle format in .txt files (for iPad compatibility)
    function detectSubtitleFormat(content) {
        const lines = content.split(/\r?\n/).slice(0, 50);

        // VTT header check
        if (lines[0]?.trim().toUpperCase() === 'WEBVTT') return 'vtt';

        // SRT/VTT timecode pattern: XX:XX:XX,XXX --> or XX:XX:XX.XXX --> or XX:XX,XXX -->
        const srtTimecodePattern = /\d{1,2}:\d{2}(?::\d{2})?[,.:]\d{3}\s*-->/;

        // Bracket-style timecode pattern: [00:00] or [00:00:00] (common in transcription exports)
        const bracketTimecodePattern = /^\s*\[\d{1,2}:\d{2}(?::\d{2})?\]/;

        let bracketCount = 0;
        for (const line of lines) {
            if (srtTimecodePattern.test(line)) return 'srt';
            if (bracketTimecodePattern.test(line)) bracketCount++;
        }

        // If 3+ bracket timecodes found, treat as subtitle file
        if (bracketCount >= 3) return 'srt';

        return null; // Not a subtitle file
    }

    // Show confirmation dialog for detected subtitle format
    function showSubtitleDetectionDialog() {
        return new Promise((resolve) => {
            const result = confirm(UI_STRINGS.subtitle.detectPrompt);
            resolve(result);
        });
    }

    function processFile(file) {
        const allowedExtensions = ['.txt', '.md', '.srt', '.vtt', '.csv', '.tsv', '.json', '.pdf'];
        const fileName = file.name.toLowerCase();
        // Preserve original extension but append _POJ
        const namePart = file.name.substring(0, file.name.lastIndexOf('.'));
        let extPart = file.name.substring(file.name.lastIndexOf('.'));

        // If PDF, change extension to .txt for the output file
        if (extPart.toLowerCase() === '.pdf') {
            extPart = '.txt';
        }

        currentFileName = `${namePart}_POJ${extPart}`;

        const isValid = allowedExtensions.some(ext => fileName.endsWith(ext));

        if (!isValid) {
            alert(UI_STRINGS.messages.fileTypeError + allowedExtensions.join(', '));
            return;
        }

        const isCsv = fileName.endsWith('.csv') || fileName.endsWith('.tsv');
        const isPdf = fileName.endsWith('.pdf');
        const separator = fileName.endsWith('.tsv') ? '\t' : ',';

        // Handle PDF files separately
        if (isPdf) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    // Configure PDF.js worker (local file)
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';

                    // Load and parse PDF
                    const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        // Preserve newlines by checking hasEOL property on each text item
                        // Also add spaces between items to prevent word concatenation
                        let pageText = '';
                        textContent.items.forEach((item, idx) => {
                            pageText += item.str;
                            if (item.hasEOL) {
                                pageText += '\n';
                            } else if (idx < textContent.items.length - 1) {
                                // Add space between items if not end of line
                                // (prevents words from being concatenated)
                                pageText += ' ';
                            }
                        });
                        fullText += pageText + '\n';
                    }

                    // Collapse expander and hide CSV options
                    const expander = document.getElementById('file-upload-expander');
                    if (expander) expander.open = false;
                    const csvExpander = document.getElementById('csv-options-expander');
                    if (csvExpander) csvExpander.style.display = 'none';
                    const jsonExpander = document.getElementById('json-options-expander');
                    if (jsonExpander) jsonExpander.style.display = 'none';
                    const subtitleExpander = document.getElementById('subtitle-options-expander');
                    if (subtitleExpander) subtitleExpander.style.display = 'none';
                    currentCsvData = null;

                    // Convert and display
                    const converted = window.TL_Converter.convertText(fullText);
                    currentFileOutput = converted;
                    updatePreviewLabel('pdf');
                    document.getElementById('csv-preview-table-container').style.display = 'none';
                    outputPreview.style.display = 'block';
                    outputPreview.value = converted.slice(0, 2000) + (converted.length > 2000 ? UI_STRINGS.file.truncationSuffix : '');
                    fileOutputSection.style.display = 'flex';
                } catch (error) {
                    console.error('PDF parsing error:', error);
                    alert(UI_STRINGS.messages.pdfParseError + error.message);
                }
            };
            reader.readAsArrayBuffer(file);
            return; // Exit early for PDFs
        }

        // Handle text-based files (TXT, CSV, JSON, etc.)
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;

            if (isCsv) {
                // CSV Mode
                currentCsvSeparator = separator;
                const parsed = parseCSV(content, separator);
                if (parsed && parsed.headers.length > 0) {
                    currentCsvData = parsed;

                    updatePreviewLabel(fileName.endsWith('.tsv') ? 'tsv' : 'csv');

                    // Collapse Expander
                    const expander = document.getElementById('file-upload-expander');
                    if (expander) expander.open = false;

                    // Show CSV Options Expander
                    const csvExpander = document.getElementById('csv-options-expander');
                    if (csvExpander) {
                        csvExpander.style.display = 'block';
                        csvExpander.open = true;
                    }
                    const jsonExpander = document.getElementById('json-options-expander');
                    if (jsonExpander) jsonExpander.style.display = 'none';
                    const subtitleExpander = document.getElementById('subtitle-options-expander');
                    if (subtitleExpander) subtitleExpander.style.display = 'none';
                    fileOutputSection.style.display = 'none';
                    document.getElementById('csv-preview-table-container').style.display = 'none'; // Ensure table is hidden initially
                    outputPreview.style.display = 'none'; // Hide text preview
                    outputPreview.value = '';

                    // Populate Columns
                    csvColumnsList.innerHTML = '';
                    parsed.headers.forEach(header => {
                        const div = document.createElement('div');
                        div.style.display = 'flex';
                        div.style.alignItems = 'center';
                        div.style.gap = '0.5rem';

                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.value = header;
                        checkbox.id = `col-${header}`;

                        const label = document.createElement('label');
                        label.htmlFor = `col-${header}`;
                        label.textContent = header;
                        label.style.fontWeight = 'normal';
                        label.style.cursor = 'pointer';

                        div.appendChild(checkbox);
                        div.appendChild(label);
                        csvColumnsList.appendChild(div);
                    });
                }
            } else if (fileName.endsWith('.json')) {
                // JSON Mode
                try {
                    const jsonData = JSON.parse(content);
                    currentJsonData = jsonData;
                    currentJsonRawContent = content;

                    updatePreviewLabel('json');

                    // Collapse upload expander
                    const expander = document.getElementById('file-upload-expander');
                    if (expander) expander.open = false;

                    // Hide CSV expander, show JSON expander
                    const csvExpander = document.getElementById('csv-options-expander');
                    if (csvExpander) csvExpander.style.display = 'none';
                    const jsonExpander = document.getElementById('json-options-expander');
                    if (jsonExpander) {
                        jsonExpander.style.display = 'block';
                        jsonExpander.open = true;
                    }
                    const subtitleExpander = document.getElementById('subtitle-options-expander');
                    if (subtitleExpander) subtitleExpander.style.display = 'none';
                    fileOutputSection.style.display = 'none';

                    // Extract unique keys from JSON
                    const keys = extractJsonKeys(jsonData);
                    currentJsonPaths = keys;

                    // Populate key checkboxes
                    const jsonKeysList = document.getElementById('json-keys-list');
                    jsonKeysList.innerHTML = '';
                    keys.forEach((keyInfo, index) => {
                        const div = document.createElement('div');
                        div.style.display = 'flex';
                        div.style.alignItems = 'flex-start';
                        div.style.gap = '0.5rem';

                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.value = index;
                        checkbox.id = `json-key-${index}`;

                        const label = document.createElement('label');
                        label.htmlFor = `json-key-${index}`;
                        label.style.fontWeight = 'normal';
                        label.style.cursor = 'pointer';
                        label.style.wordBreak = 'break-all';

                        // Show key name, count (if array), and sample value
                        const preview = keyInfo.sampleValue.length > 25 ? keyInfo.sampleValue.slice(0, 25) + '...' : keyInfo.sampleValue;
                        if (keyInfo.isArrayKey) {
                            label.textContent = `${keyInfo.key} (×${keyInfo.count}): "${preview}"`;
                        } else {
                            label.textContent = `${keyInfo.key}: "${preview}"`;
                        }

                        div.appendChild(checkbox);
                        div.appendChild(label);
                        jsonKeysList.appendChild(div);
                    });
                } catch (err) {
                    alert(UI_STRINGS.messages.jsonParseError + err.message);
                }
            } else if (fileName.endsWith('.srt') || fileName.endsWith('.vtt')) {
                // Subtitle Mode (SRT/VTT)
                const ext = fileName.endsWith('.vtt') ? 'vtt' : 'srt';
                updatePreviewLabel(ext);

                // Parse subtitle blocks
                const parsedSubtitle = parseSubtitle(content, ext);
                currentSubtitleData = parsedSubtitle;
                currentSubtitleRawContent = content;
                currentSubtitleExt = ext;

                // Check if any block has multiple lines
                const hasMultiLine = parsedSubtitle.blocks.some(b => b.textLines.length > 1);

                const expander = document.getElementById('file-upload-expander');
                if (expander) expander.open = false;
                const csvExpander = document.getElementById('csv-options-expander');
                if (csvExpander) csvExpander.style.display = 'none';
                const jsonExpander = document.getElementById('json-options-expander');
                if (jsonExpander) jsonExpander.style.display = 'none';
                const subtitleExpander = document.getElementById('subtitle-options-expander');

                if (hasMultiLine) {
                    // Show subtitle options
                    if (subtitleExpander) {
                        subtitleExpander.style.display = 'block';
                        subtitleExpander.open = true;
                    }
                    fileOutputSection.style.display = 'none';
                } else {
                    // Single-line: convert directly
                    if (subtitleExpander) subtitleExpander.style.display = 'none';
                    const converted = convertSubtitle(parsedSubtitle, 'all');
                    currentFileOutput = converted;
                    document.getElementById('csv-preview-table-container').style.display = 'none';
                    outputPreview.style.display = 'block';
                    outputPreview.value = converted.slice(0, 2000) + (converted.length > 2000 ? UI_STRINGS.file.truncationSuffix : '');
                    fileOutputSection.style.display = 'flex';
                }
            } else {
                // Standard Mode (txt, md) - with smart subtitle detection for .txt
                const ext = fileName.substring(fileName.lastIndexOf('.') + 1);

                // Smart detect subtitle format in .txt files
                if (ext === 'txt') {
                    const detectedFormat = detectSubtitleFormat(content);
                    if (detectedFormat) {
                        // Show confirmation dialog
                        showSubtitleDetectionDialog().then(useSubtitleMode => {
                            if (useSubtitleMode) {
                                // User chose subtitle mode - process as SRT/VTT
                                currentFileName = currentFileName.replace(/\.txt$/i, '.' + detectedFormat);
                                updatePreviewLabel(detectedFormat);

                                const parsedSubtitle = parseSubtitle(content, detectedFormat);
                                currentSubtitleData = parsedSubtitle;
                                currentSubtitleRawContent = content;
                                currentSubtitleExt = detectedFormat;

                                const hasMultiLine = parsedSubtitle.blocks.some(b => b.textLines.length > 1);

                                const expander = document.getElementById('file-upload-expander');
                                if (expander) expander.open = false;
                                const csvExpander = document.getElementById('csv-options-expander');
                                if (csvExpander) csvExpander.style.display = 'none';
                                const jsonExpander = document.getElementById('json-options-expander');
                                if (jsonExpander) jsonExpander.style.display = 'none';
                                const subtitleExpander = document.getElementById('subtitle-options-expander');

                                if (hasMultiLine) {
                                    if (subtitleExpander) {
                                        subtitleExpander.style.display = 'block';
                                        subtitleExpander.open = true;
                                    }
                                    fileOutputSection.style.display = 'none';
                                } else {
                                    if (subtitleExpander) subtitleExpander.style.display = 'none';
                                    const converted = convertSubtitle(parsedSubtitle, 'all');
                                    currentFileOutput = converted;
                                    document.getElementById('csv-preview-table-container').style.display = 'none';
                                    outputPreview.style.display = 'block';
                                    outputPreview.value = converted.slice(0, 2000) + (converted.length > 2000 ? UI_STRINGS.file.truncationSuffix : '');
                                    fileOutputSection.style.display = 'flex';
                                }
                            } else {
                                // User chose plain text mode
                                processAsPlainText(content, 'text');
                            }
                        });
                        return; // Exit early, async handling
                    }
                }

                // Process as plain text (md or txt without subtitle format)
                processAsPlainText(content, ext === 'md' ? 'md' : 'text');
            }

            // Helper function for plain text processing
            function processAsPlainText(content, labelType) {
                updatePreviewLabel(labelType);

                const expander = document.getElementById('file-upload-expander');
                if (expander) expander.open = false;
                const csvExpander = document.getElementById('csv-options-expander');
                if (csvExpander) csvExpander.style.display = 'none';
                const jsonExpander = document.getElementById('json-options-expander');
                if (jsonExpander) jsonExpander.style.display = 'none';
                const subtitleExpander = document.getElementById('subtitle-options-expander');
                if (subtitleExpander) subtitleExpander.style.display = 'none';
                currentCsvData = null;
                currentJsonData = null;
                document.getElementById('csv-preview-table-container').style.display = 'none';
                outputPreview.style.display = 'block';

                const converted = window.TL_Converter.convertText(content);
                currentFileOutput = converted;
                outputPreview.value = converted.slice(0, 2000) + (converted.length > 2000 ? UI_STRINGS.file.truncationSuffix : '');
                fileOutputSection.style.display = 'flex';
            }
        };
        reader.readAsText(file);
    }

    // Helper: Extract unique keys from JSON (handles arrays of objects with same schema)
    let currentJsonData = null;
    let currentJsonRawContent = '';
    let currentJsonPaths = []; // { key, isArrayKey, sampleValue }
    let currentJsonIsArray = false;

    function extractJsonKeys(obj) {
        const keys = [];

        // Check if root is array of objects with consistent schema
        if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
            currentJsonIsArray = true;
            // Get keys from first object as schema
            const schemaKeys = Object.keys(obj[0]);
            schemaKeys.forEach(key => {
                if (typeof obj[0][key] === 'string') {
                    // Count how many items have this key as string
                    const count = obj.filter(item => typeof item[key] === 'string').length;
                    keys.push({
                        key: key,
                        isArrayKey: true,
                        sampleValue: obj[0][key],
                        count: count
                    });
                }
            });
        } else if (typeof obj === 'object' && obj !== null) {
            currentJsonIsArray = false;
            // Regular object - traverse and find all string paths
            function traverse(current, path) {
                if (typeof current === 'string') {
                    keys.push({
                        key: path,
                        isArrayKey: false,
                        sampleValue: current,
                        count: 1
                    });
                } else if (Array.isArray(current)) {
                    current.forEach((item, i) => {
                        traverse(item, `${path}[${i}]`);
                    });
                } else if (current !== null && typeof current === 'object') {
                    Object.keys(current).forEach(k => {
                        const newPath = path ? `${path}.${k}` : k;
                        traverse(current[k], newPath);
                    });
                }
            }
            traverse(obj, '');
        }

        return keys;
    }

    // Subtitle state variables
    let currentSubtitleData = null;
    let currentSubtitleRawContent = '';
    let currentSubtitleExt = 'srt';

    // Helper to detect timecode lines (both standard and bracket formats)
    function isTimecode(line) {
        if (!line) return false;
        // Standard SRT/VTT: 00:00:00,000 --> 00:00:00,000
        if (line.includes('-->')) return true;
        // Bracket style: [00:00] or [00:00:00]
        if (/^\s*\[\d{1,2}:\d{2}(?::\d{2})?\]/.test(line)) return true;
        return false;
    }

    // Parse SRT/VTT into blocks (handles both standard and bracket timecode formats)
    function parseSubtitle(content, ext) {
        const lines = content.split(/\r?\n/);
        const blocks = [];
        let i = 0;
        const headerLines = { urlLines: [], titleBlock: null };

        // Parse header section (before first timecode) for URL and TITLE
        while (i < lines.length && !isTimecode(lines[i])) {
            const line = lines[i].trim();
            if (/^url:/i.test(line)) {
                headerLines.urlLines.push(lines[i]);
            } else if (/^title:/i.test(line)) {
                // TITLE: found - extract prefix and first line content
                const match = lines[i].match(/^(title:\s*)/i);
                const prefix = match ? match[1] : 'TITLE: ';
                const firstLineContent = lines[i].substring(prefix.length);
                const titleTextLines = [];
                if (firstLineContent.trim() !== '') {
                    titleTextLines.push(firstLineContent);
                }
                i++;
                // Continue collecting lines until empty line or timecode
                while (i < lines.length && lines[i].trim() !== '' && !isTimecode(lines[i])) {
                    titleTextLines.push(lines[i]);
                    i++;
                }
                headerLines.titleBlock = { prefix, textLines: titleTextLines };
                continue;
            }
            i++;
        }

        // Parse subtitle blocks
        while (i < lines.length) {
            // Skip empty lines
            while (i < lines.length && lines[i].trim() === '') i++;
            if (i >= lines.length) break;

            const block = { cueId: '', timestamp: '', textLines: [], rawLines: [] };

            // Check if this line is a timecode
            if (isTimecode(lines[i])) {
                block.timestamp = lines[i];
                block.rawLines.push(lines[i]);
                i++;
            } else {
                // Could be cue ID followed by timecode
                block.cueId = lines[i];
                block.rawLines.push(lines[i]);
                i++;

                // Check next line for timestamp
                if (i < lines.length && isTimecode(lines[i])) {
                    block.timestamp = lines[i];
                    block.rawLines.push(lines[i]);
                    i++;
                }
            }

            // Text lines until empty line or next timecode
            while (i < lines.length && lines[i].trim() !== '' && !isTimecode(lines[i])) {
                const line = lines[i];
                block.rawLines.push(line);
                block.textLines.push({ text: line, isUrl: false, isTitle: false });
                i++;
            }

            if (block.timestamp || block.textLines.length > 0) {
                blocks.push(block);
            }
        }

        return { blocks, headerLines };
    }

    // Convert subtitle based on mode
    function convertSubtitle(parsed, mode) {
        const resultLines = [];

        // Add header lines first
        // URL lines - preserved as-is
        parsed.headerLines.urlLines.forEach(line => {
            resultLines.push(line);
        });

        // TITLE block - apply same line selection rules as subtitle blocks
        if (parsed.headerLines.titleBlock) {
            const titleBlock = parsed.headerLines.titleBlock;
            titleBlock.textLines.forEach((lineText, lineIndex) => {
                const lineNum = lineIndex + 1;
                let shouldConvert = false;

                if (mode === 'all') {
                    shouldConvert = true;
                } else if (mode === 'line1' && lineNum === 1) {
                    shouldConvert = true;
                } else if (mode === 'line2' && lineNum === 2) {
                    shouldConvert = true;
                } else if (mode === 'line3plus' && lineNum >= 3) {
                    shouldConvert = true;
                }

                // First line gets the TITLE: prefix
                const prefix = lineIndex === 0 ? titleBlock.prefix : '';
                if (shouldConvert) {
                    resultLines.push(prefix + window.TL_Converter.convertText(lineText));
                } else {
                    resultLines.push(prefix + lineText);
                }
            });
        }

        // Add blank line after header if there were header lines
        if (parsed.headerLines.urlLines.length > 0 || parsed.headerLines.titleBlock) {
            resultLines.push('');
        }

        parsed.blocks.forEach(block => {
            // Add cue ID if present
            if (block.cueId) resultLines.push(block.cueId);
            // Add timestamp
            resultLines.push(block.timestamp);

            // Convert text lines based on mode - all are regular text now
            block.textLines.forEach((lineObj, lineIndex) => {
                const lineNum = lineIndex + 1;
                let shouldConvert = false;

                if (mode === 'all') {
                    shouldConvert = true;
                } else if (mode === 'line1' && lineNum === 1) {
                    shouldConvert = true;
                } else if (mode === 'line2' && lineNum === 2) {
                    shouldConvert = true;
                } else if (mode === 'line3plus' && lineNum >= 3) {
                    shouldConvert = true;
                }

                if (shouldConvert) {
                    resultLines.push(window.TL_Converter.convertText(lineObj.text));
                } else {
                    resultLines.push(lineObj.text);
                }
            });

            // Add empty line after block
            resultLines.push('');
        });

        return resultLines.join('\n');
    }

    // CSV Convert Button
    if (btnConvertCsv) {
        btnConvertCsv.addEventListener('click', () => {
            if (!currentCsvData) return;

            // Get Selected Columns
            const checkboxes = csvColumnsList.querySelectorAll('input[type="checkbox"]:checked');
            const selectedCols = Array.from(checkboxes).map(cb => cb.value);

            if (selectedCols.length === 0) {
                alert(UI_STRINGS.messages.selectColumnsError);
                return;
            }

            // Get Mode
            const mode = document.querySelector('input[name="csv-mode"]:checked').value; // 'only' or 'insert'

            // Processing Strategy: Aggregate -> Convert -> Split back
            // "The selected columns are aggregated into a text format .csv with utf-8 encoding and convert as text at a time, no need to convert raw by row."
            // Although implementation detail: converting the whole column string is faster than 1000 calls.

            // First, convert all selected columns
            const convertedData = {}; // { originalColName: [convertedValues] }
            selectedCols.forEach(col => {
                const colValues = currentCsvData.rows.map(r => r[col] || '');
                const combinedText = colValues.join('\n:::SEP:::\n');
                const convertedCombined = window.TL_Converter.convertText(combinedText);
                convertedData[col] = convertedCombined.split('\n:::SEP:::\n');
            });

            // Build new headers and rows based on mode
            const newHeaders = [];
            const finalRows = currentCsvData.rows.map(() => ({}));

            if (mode === 'insert') {
                // Insert POJ column right after each original column
                currentCsvData.headers.forEach(h => {
                    newHeaders.push(h);
                    currentCsvData.rows.forEach((row, i) => {
                        finalRows[i][h] = row[h];
                    });

                    // If this column was selected, insert its POJ version right after
                    if (selectedCols.includes(h)) {
                        const pojColName = h + '_POJ';
                        newHeaders.push(pojColName);
                        currentCsvData.rows.forEach((row, i) => {
                            finalRows[i][pojColName] = convertedData[h][i] || '';
                        });
                    }
                });
            } else if (mode === 'original-plus') {
                // Selected original columns + their converted versions
                selectedCols.forEach(col => {
                    newHeaders.push(col);
                    currentCsvData.rows.forEach((row, i) => {
                        finalRows[i][col] = row[col];
                    });

                    const pojColName = col + '_POJ';
                    newHeaders.push(pojColName);
                    currentCsvData.rows.forEach((row, i) => {
                        finalRows[i][pojColName] = convertedData[col][i] || '';
                    });
                });
            } else {
                // 'only' mode - just the converted columns
                selectedCols.forEach(col => {
                    const pojColName = col + '_POJ';
                    newHeaders.push(pojColName);
                    currentCsvData.rows.forEach((row, i) => {
                        finalRows[i][pojColName] = convertedData[col][i] || '';
                    });
                });
            }

            // Generate Result
            const resultCSV = generateCSV(newHeaders, finalRows, currentCsvSeparator);

            currentFileOutput = resultCSV;
            // Update Preview: Table View
            const tableContainer = document.getElementById('csv-preview-table-container');
            tableContainer.innerHTML = '';
            tableContainer.appendChild(renderTable(newHeaders, finalRows));

            tableContainer.style.display = 'block';
            outputPreview.style.display = 'none';

            // Collapse CSV Options Expander
            const csvExpander = document.getElementById('csv-options-expander');
            if (csvExpander) csvExpander.open = false;

            fileOutputSection.style.display = 'flex';
        });
    }

    // JSON Convert Button
    const btnConvertJson = document.getElementById('btn-convert-json');
    if (btnConvertJson) {
        btnConvertJson.addEventListener('click', () => {
            if (!currentJsonData) return;

            const jsonKeysList = document.getElementById('json-keys-list');
            const checkboxes = jsonKeysList.querySelectorAll('input[type="checkbox"]:checked');
            const selectedIndices = Array.from(checkboxes).map(cb => parseInt(cb.value));

            if (selectedIndices.length === 0) {
                alert(UI_STRINGS.messages.selectKeysError);
                return;
            }

            const mode = document.querySelector('input[name="json-mode"]:checked').value;
            const selectedKeys = selectedIndices.map(i => currentJsonPaths[i]);

            let result;

            if (currentJsonIsArray) {
                // Array of objects - convert all items for selected keys
                const convertedData = {}; // { key: [convertedValues] }

                selectedKeys.forEach(keyInfo => {
                    const values = currentJsonData.map(item => item[keyInfo.key] || '');
                    const combined = values.join('\n:::JSON_SEP:::\n');
                    const converted = window.TL_Converter.convertText(combined);
                    convertedData[keyInfo.key] = converted.split('\n:::JSON_SEP:::\n');
                });

                if (mode === 'only') {
                    // Only POJ keys
                    result = currentJsonData.map((item, i) => {
                        const newItem = {};
                        selectedKeys.forEach(keyInfo => {
                            newItem[keyInfo.key + '_POJ'] = convertedData[keyInfo.key][i] || '';
                        });
                        return newItem;
                    });
                } else if (mode === 'original-plus') {
                    // Selected original + POJ
                    result = currentJsonData.map((item, i) => {
                        const newItem = {};
                        selectedKeys.forEach(keyInfo => {
                            newItem[keyInfo.key] = item[keyInfo.key];
                            newItem[keyInfo.key + '_POJ'] = convertedData[keyInfo.key][i] || '';
                        });
                        return newItem;
                    });
                } else {
                    // Insert - maintain key order, POJ right after original
                    const selectedKeyNames = new Set(selectedKeys.map(k => k.key));
                    result = currentJsonData.map((item, i) => {
                        const newItem = {};
                        Object.keys(item).forEach(key => {
                            newItem[key] = item[key];
                            if (selectedKeyNames.has(key)) {
                                newItem[key + '_POJ'] = convertedData[key][i] || '';
                            }
                        });
                        return newItem;
                    });
                }
            } else {
                // Nested object - convert individual paths
                const combinedText = selectedKeys.map(k => k.sampleValue).join('\n:::JSON_SEP:::\n');
                const convertedCombined = window.TL_Converter.convertText(combinedText);
                const convertedValues = convertedCombined.split('\n:::JSON_SEP:::\n');

                if (mode === 'only') {
                    result = {};
                    selectedKeys.forEach((keyInfo, i) => {
                        setNestedValue(result, keyInfo.key + '_POJ', convertedValues[i] || '');
                    });
                } else if (mode === 'original-plus') {
                    result = {};
                    selectedKeys.forEach((keyInfo, i) => {
                        setNestedValue(result, keyInfo.key, keyInfo.sampleValue);
                        setNestedValue(result, keyInfo.key + '_POJ', convertedValues[i] || '');
                    });
                } else {
                    result = JSON.parse(JSON.stringify(currentJsonData));
                    selectedKeys.forEach((keyInfo, i) => {
                        setNestedValue(result, keyInfo.key + '_POJ', convertedValues[i] || '');
                    });
                }
            }

            // Format with pretty print
            const prettyJson = JSON.stringify(result, null, 2);
            currentFileOutput = prettyJson;

            // Display
            document.getElementById('csv-preview-table-container').style.display = 'none';
            outputPreview.style.display = 'block';
            outputPreview.value = prettyJson.slice(0, 5000) + (prettyJson.length > 5000 ? '\n...(truncated)' : '');

            // Collapse JSON expander
            const jsonExpander = document.getElementById('json-options-expander');
            if (jsonExpander) jsonExpander.open = false;

            fileOutputSection.style.display = 'flex';
        });
    }

    // Helper: Set nested value in object by path string
    function setNestedValue(obj, path, value) {
        const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const key = parts[i];
            const nextKey = parts[i + 1];
            if (!(key in current)) {
                current[key] = /^\d+$/.test(nextKey) ? [] : {};
            }
            current = current[key];
        }
        current[parts[parts.length - 1]] = value;
    }

    // JSON Reset Button
    document.getElementById('btn-reset-json').addEventListener('click', () => {
        uiTriggerFeedback(document.getElementById('btn-reset-json'));
        resetFileView();
    });

    // Subtitle Convert Button
    const btnConvertSubtitle = document.getElementById('btn-convert-subtitle');
    if (btnConvertSubtitle) {
        btnConvertSubtitle.addEventListener('click', () => {
            if (!currentSubtitleData) return;

            const modeRadio = document.querySelector('input[name="subtitle-mode"]:checked');
            if (!modeRadio) {
                alert(UI_STRINGS.messages.selectSubtitleLinesError);
                return;
            }

            uiTriggerFeedback(btnConvertSubtitle);
            const mode = modeRadio.value;
            const converted = convertSubtitle(currentSubtitleData, mode);
            currentFileOutput = converted;

            document.getElementById('csv-preview-table-container').style.display = 'none';
            outputPreview.style.display = 'block';
            outputPreview.value = converted.slice(0, 2000) + (converted.length > 2000 ? UI_STRINGS.file.truncationSuffix : '');

            // Collapse subtitle expander
            const subtitleExpander = document.getElementById('subtitle-options-expander');
            if (subtitleExpander) subtitleExpander.open = false;

            fileOutputSection.style.display = 'flex';
        });
    }

    // Subtitle Reset Button
    document.getElementById('btn-reset-subtitle').addEventListener('click', () => {
        uiTriggerFeedback(document.getElementById('btn-reset-subtitle'));
        resetFileView();
    });

    document.getElementById('btn-copy-file').addEventListener('click', async () => {
        if (currentFileOutput) {
            uiTriggerFeedback(document.getElementById('btn-copy-file'));
            await navigator.clipboard.writeText(currentFileOutput);
        }
    });

    document.getElementById('btn-download-file').addEventListener('click', () => {
        uiTriggerFeedback(document.getElementById('btn-download-file'));
        downloadText(currentFileOutput, currentFileName);
    });



});
function updatePreviewLabel(type) {
    const fileLabel = document.querySelector('#panel-file .toolbar label');
    if (fileLabel && UI_STRINGS.file.fileTypes[type]) {
        fileLabel.textContent = UI_STRINGS.file.previewLabel + UI_STRINGS.file.fileTypes[type];
    } else if (fileLabel) {
        fileLabel.textContent = UI_STRINGS.file.previewLabel + UI_STRINGS.file.fileTypes.text;
    }

    // Toggle specific messages
    const msgGeneral = document.getElementById('msg-general-warning');
    const msgSpecific = document.getElementById('msg-specific-warning');

    // Set general message content if not already set (safety check)
    if (msgGeneral && !msgGeneral.textContent) {
        msgGeneral.textContent = UI_STRINGS.file.messages.general;
    }

    if (msgSpecific) {
        if (type === 'pdf') {
            msgSpecific.textContent = ' ' + UI_STRINGS.file.messages.pdf;
            msgSpecific.style.display = 'inline';
        } else {
            msgSpecific.style.display = 'none';
        }
    }
}
