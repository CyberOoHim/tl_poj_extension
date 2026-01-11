// Text Injector & Selection Scanner
// Combines existing selection scanning with new robust text injection capabilities

if (typeof window.TL_CS_Injected === 'undefined') {
    window.TL_CS_Injected = true;

    // --- State Variables ---
    let lastSavedRange = null;
    let lastActiveElement = null;
    let lastSaveTime = 0; // Track when we saved the position
    var scanTimeout = null;


    // --- Context Validity Check (Self-Healing) ---
    function isExtensionContextValid() {
        try {
            return !!(chrome.runtime && chrome.runtime.id);
        } catch (e) {
            return false;
        }
    }

    // --- Safe Message Sender ---
    function safeSendMessage(message) {
        if (!isExtensionContextValid()) return Promise.resolve(null);
        return chrome.runtime.sendMessage(message).catch(e => {
            // Suppress "Extension context invalidated" noise
            if (e.message && e.message.includes("invalidated")) {
                window.TL_CS_Injected = undefined; // Allow re-injection
            }
            return null;
        });
    }

    // --- Periodic Connection Health Check ---
    // Detect context invalidation early and allow re-injection
    const healthCheckInterval = setInterval(() => {
        if (!isExtensionContextValid()) {
            // console.log('[TL Extension] Context invalidated, awaiting re-injection');
            window.TL_CS_Injected = undefined; // Allow re-injection
            clearInterval(healthCheckInterval); // Stop checking once invalidated
        }
    }, 5000);

    // --- Site-Specific Handling Detection ---
    function getSiteInfo() {
        const h = window.location.hostname;
        return {
            isAIChat: h.includes('chat.openai.com') || h.includes('gemini.google.com') ||
                h.includes('claude.ai') || h.includes('grok.x.ai') || h.includes('x.ai'),
            isSNS: h.includes('facebook.com') || h.includes('twitter.com') || h.includes('x.com') ||
                h.includes('instagram.com') || h.includes('threads.net'),
            isGoogle: h.includes('google.com'),
            needsExtraEvents: h.includes('twitter.com') || h.includes('x.com')
        };
    }

    // --- MutationObserver for Dynamic Content (SPAs) ---
    let mutationDebounce = null;
    const observer = new MutationObserver((mutations) => {
        // Skip if no current selection
        const currentSelection = window.getSelection();
        if (!currentSelection || currentSelection.toString().trim().length === 0) return;

        // Debounce DOM change reactions
        if (mutationDebounce) clearTimeout(mutationDebounce);
        mutationDebounce = setTimeout(() => {
            const selection = currentSelection.toString().trim();
            if (selection) {
                safeSendMessage({
                    type: "TL_EXTENSION_SELECTION_UPDATE",
                    text: selection
                });
            }
        }, 500);
    });

    // Start observing after DOM is ready
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true
            });
        });
    }

    // --- Cursor Tracking & Selection Scanning ---
    document.addEventListener("selectionchange", () => {
        // 1. Immediate: Save cursor position for injection
        saveCurrentSelection();

        // 2. Debounced: Notify side panel for "Scan" tab
        if (scanTimeout) clearTimeout(scanTimeout);
        scanTimeout = setTimeout(() => {
            const selection = window.getSelection().toString().trim();
            safeSendMessage({
                type: "TL_EXTENSION_SELECTION_UPDATE",
                text: selection
            });
        }, 300);
    });

    document.addEventListener('focusin', (e) => {
        // Only save if target is editable (avoids saving when clicking non-input UI)
        if (isEditableElement(e.target)) {
            lastActiveElement = e.target;
            lastSaveTime = Date.now();
            saveCurrentSelection();
        }
    }, true);

    // Also track clicks inside editable elements for precise cursor position
    document.addEventListener('click', (e) => {
        const editable = findEditableAncestor(e.target);
        if (editable) {
            lastActiveElement = editable;
            lastSaveTime = Date.now();
            // Delay to let browser set selection after click
            setTimeout(saveCurrentSelection, 10);
        }
    }, true);

    function saveCurrentSelection() {
        try {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const element = container.nodeType === Node.TEXT_NODE
                ? container.parentElement
                : container;

            // Check if selection is inside an editable element
            const editableParent = findEditableAncestor(element);
            if (editableParent) {
                lastSavedRange = range.cloneRange();
                lastActiveElement = editableParent;
                lastSaveTime = Date.now();
            }
        } catch (e) {
            // Ignore errors
        }
    }

    function isEditableElement(element) {
        if (!element) return false;
        if (element.nodeType === Node.TEXT_NODE) return false;

        return (
            element.isContentEditable ||
            element.contentEditable === 'true' ||
            element.getAttribute('contenteditable') === 'true' ||
            element.tagName === 'TEXTAREA' ||
            (element.tagName === 'INPUT' && ['text', 'search', 'email', 'url', 'tel', 'password'].includes(element.type))
        );
    }

    function findEditableAncestor(node) {
        if (!node) return null;
        let current = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
        while (current && current !== document.body) {
            if (isEditableElement(current)) return current;
            // Also check for role="textbox" wrapper (Keep, Gmail)
            if (current.getAttribute && current.getAttribute('role') === 'textbox') return current;
            current = current.parentElement;
        }
        return null;
    }

    // --- Message Handling ---
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        // Handle PING for connection health check
        if (request.type === "TL_EXTENSION_PING") {
            sendResponse({ pong: true });
            return true;
        }

        // Handle Request for Selection (Original Feature)
        if (request.type === "TL_EXTENSION_REQUEST_SELECTION") {
            if (window.TL_LAST_FETCHED_ARTICLE) {
                sendResponse({ selection: window.TL_LAST_FETCHED_ARTICLE });
                window.TL_LAST_FETCHED_ARTICLE = null;
            } else {
                sendResponse({ selection: window.getSelection().toString() });
            }
        }

        // Handle Logic Injection (New Feature)
        if (request.type === "INJECT_TEXT") {
            const success = injectText(request.text);
            sendResponse({ success: success });
        }


        return true;
    });

    // --- Injection Logic ---
    function injectText(text) {
        if (!text) return false;

        // Check if we have a recent, valid saved position (within last 30 seconds)
        const positionAge = Date.now() - lastSaveTime;
        const hasValidPosition = lastSavedRange && lastActiveElement &&
            document.body.contains(lastActiveElement) &&
            positionAge < 30000; // 30 second timeout

        if (hasValidPosition) {
            // Use the saved position - this is the precise location user clicked
            if (lastActiveElement.tagName === 'TEXTAREA' || lastActiveElement.tagName === 'INPUT') {
                return injectIntoInput(text);
            }
            return injectIntoContentEditable(text);
        }

        // Fallback: Check current active element
        const currentActive = document.activeElement;
        if (currentActive && currentActive !== document.body && isEditableElement(currentActive)) {
            lastActiveElement = currentActive;
            if (currentActive.tagName === 'TEXTAREA' || currentActive.tagName === 'INPUT') {
                return injectIntoInput(text);
            }
            // For contenteditable, place at end since we don't have saved range
            return injectAtEnd(currentActive, text);
        }

        console.warn('No valid injection target found. Click in a text field first.');
        return false;
    }

    function injectIntoContentEditable(text) {
        try {
            const targetElement = lastActiveElement;
            if (!targetElement || !lastSavedRange) return false;

            // Restore focus
            targetElement.focus();

            // Restore selection
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(lastSavedRange);

            // Use execCommand - it handles the insertion properly
            let success = false;
            try {
                success = document.execCommand('insertText', false, text);
            } catch (e) {
                console.warn('execCommand failed, trying fallback');
            }

            // Fallback: Manual DOM insertion (only if execCommand failed)
            if (!success) {
                lastSavedRange.deleteContents();
                const textNode = document.createTextNode(text);
                lastSavedRange.insertNode(textNode);

                // Move cursor after inserted text
                lastSavedRange.setStartAfter(textNode);
                lastSavedRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(lastSavedRange);
            }

            // Trigger events - but only minimal ones to avoid duplicate insertion
            triggerMinimalEvents(targetElement);
            return true;
        } catch (e) {
            console.error('ContentEditable injection failed:', e);
            return false;
        }
    }

    function injectIntoInput(text) {
        try {
            const element = lastActiveElement;
            if (!element) return false;

            element.focus();

            if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                const start = element.selectionStart || 0;
                const end = element.selectionEnd || 0;

                // Use setRangeText for clean insertion
                if (typeof element.setRangeText === 'function') {
                    element.setRangeText(text, start, end, 'end');
                } else {
                    // Manual splicing
                    const before = element.value.substring(0, start);
                    const after = element.value.substring(end);
                    element.value = before + text + after;
                    const newPos = start + text.length;
                    element.selectionStart = newPos;
                    element.selectionEnd = newPos;
                }

                // Trigger input event for frameworks
                triggerMinimalEvents(element);
                return true;
            }

            return false;
        } catch (e) {
            console.error('Input injection failed:', e);
            return false;
        }
    }

    function injectAtEnd(element, text) {
        try {
            element.focus();

            // Place cursor at end
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(element);
            range.collapse(false); // collapse to end
            selection.removeAllRanges();
            selection.addRange(range);

            lastSavedRange = range;
            lastActiveElement = element;

            return injectIntoContentEditable(text);
        } catch (e) {
            console.error('Inject at end failed:', e);
            return false;
        }
    }

    // --- Event Triggering (Minimal to avoid duplicate insertion) ---
    function triggerMinimalEvents(element) {
        // Only trigger input event - this is what frameworks listen to
        // Don't trigger beforeinput (can cause re-insertion in some frameworks)
        const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: false,
            inputType: 'insertText'
        });
        element.dispatchEvent(inputEvent);

        // For Google Keep and similar apps: need to clear placeholder properly
        if (needsPlaceholderClear()) {
            // Dispatch focus/blur to force placeholder update
            element.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

            // Also dispatch change event
            element.dispatchEvent(new Event('change', { bubbles: true }));

            // For contenteditable, ensure the aria-label (placeholder) updates
            if (element.isContentEditable && element.hasAttribute('aria-label')) {
                // Force a reflow to update placeholder visibility
                const text = element.textContent;
                if (text && text.trim().length > 0) {
                    element.setAttribute('data-has-content', 'true');
                }
            }
        }

        // For sites that need keyboard simulation to update UI state
        if (needsKeyboardSimulation()) {
            const keyEvent = new KeyboardEvent('keyup', {
                bubbles: true,
                cancelable: true,
                key: 'Unidentified'
            });
            element.dispatchEvent(keyEvent);
        }
    }

    function needsKeyboardSimulation() {
        const h = window.location.hostname;
        return h.includes('twitter.com') || h.includes('x.com');
    }

    function needsPlaceholderClear() {
        const h = window.location.hostname;
        return h.includes('keep.google.com') ||
            h.includes('docs.google.com') ||
            h.includes('mail.google.com');
    }
}
