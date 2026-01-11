// Background script for Context Menu handling
try {
    importScripts('ui_config.js');
} catch (e) {
    console.error(e);
}

// State tracking per tab to manage menu visibility
const tabStates = {}; // { tabId: { pageConverted: bool, hasHistory: bool } }

// Open Side Panel on Action Click
// Note: This requires Chrome 116+. For older versions, this API might fail, but it's standard now.
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "fetch-article",
        title: UI_STRINGS.contextMenus.fetchArticle,
        contexts: ["page", "selection"],
        visible: true
    });



    chrome.contextMenus.create({
        id: "convert-page",
        title: UI_STRINGS.contextMenus.convertPage,
        contexts: ["page", "selection"],
        visible: true
    });

    chrome.contextMenus.create({
        id: "undo-conversion",
        title: UI_STRINGS.contextMenus.undo,
        contexts: ["all"],
        visible: false
    });

    // Clear text menu (for sidepanel)
    chrome.contextMenus.create({
        id: "clear-text",
        title: UI_STRINGS.contextMenus.clearText,
        contexts: ["all"],
        visible: true,
        enabled: true
    });
});

// Update menus when switching tabs
chrome.tabs.onActivated.addListener(({ tabId }) => {
    updateContextMenus(tabId);
});

// Listen for state updates from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "TL_EXTENSION_STATE_UPDATE" && sender.tab) {
        tabStates[sender.tab.id] = {
            pageConverted: message.pageConverted,
            hasHistory: message.hasHistory
        };
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id === sender.tab.id) {
                updateContextMenus(sender.tab.id);
            }
        });
    }

    // Handle auto-convert state requests from sidepanel
    if (message.type === "GET_AUTO_CONVERT_STATE") {
        sendResponse({ isAutoConvertMode: isAutoConvertMode });
        return true;
    }

    // Handle clear-text menu state updates from sidepanel tab switching
    if (message.type === "UPDATE_CLEAR_TEXT_STATE") {
        chrome.contextMenus.update("clear-text", {
            enabled: message.enabled
        });
        return true;
    }



    // Handle auto-convert state changes from sidepanel
    if (message.type === "SET_AUTO_CONVERT_STATE") {
        isAutoConvertMode = message.enabled;
        // Broadcast to all tabs/sidepanels
        chrome.runtime.sendMessage({
            type: "AUTO_CONVERT_STATE_CHANGED",
            enabled: isAutoConvertMode
        }).catch(() => { }); // Ignore if no listeners
        sendResponse({ success: true });
        return true;
    }

    // Handle page conversion trigger from sidepanel toggle
    if (message.type === "TRIGGER_PAGE_CONVERSION") {
        const { action } = message;
        let pTabId = message.tabId;

        const performAction = (tid) => {
            if (action === "convert") {
                injectAndRun(tid, "convertPageContent");
            } else if (action === "undo") {
                injectAndRun(tid, "undoAll");
            }
        };

        if (pTabId) {
            performAction(pTabId);
        } else {
            // If no tabId provided, find active tab in last focused window
            chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    performAction(tabs[0].id);
                } else {
                    console.warn("Could not find active tab to trigger conversion");
                }
            });
        }

        sendResponse({ success: true });
        return true;
    }
});

function updateContextMenus(tabId) {
    const state = tabStates[tabId] || { pageConverted: false, hasHistory: false };

    // Check if this is a known SPA where article extraction won't work
    chrome.tabs.get(tabId).then(tab => {
        const url = tab?.url || '';

        // Check for restricted URL schemes first
        const isRestrictedScheme = !url ||
            url.startsWith('chrome://') ||
            url.startsWith('chrome-extension://') ||
            url.startsWith('edge://') ||
            url.startsWith('about:') ||
            url.startsWith('moz-extension://') ||
            url.startsWith('devtools://');

        let isSpaPage = false;
        let hostname = '';

        if (!isRestrictedScheme) {
            try {
                hostname = new URL(url).hostname;
            } catch (e) {
                hostname = '';
            }

            // Sites where Readability.js doesn't work well (SPAs, chat apps, social feeds)
            const knownSpaSites = [
                // AI Chat Apps
                'gemini.google.com',
                'chat.openai.com',
                'chatgpt.com',
                'claude.ai',
                'grok.x.ai',
                'x.ai',
                // Social Media
                'facebook.com',
                'www.facebook.com',
                'twitter.com',
                'x.com',
                'instagram.com',
                'www.instagram.com',
                'threads.net',
                'www.threads.net',
                'linkedin.com',
                'www.linkedin.com',
                // Messaging Apps
                'web.whatsapp.com',
                'discord.com',
                'slack.com',
                'web.line.me',
                // Google Apps
                'keep.google.com',
                'mail.google.com',
                'docs.google.com',
                'drive.google.com',
                'calendar.google.com',
                'accounts.google.com',
                'myaccount.google.com'
            ];

            isSpaPage = knownSpaSites.some(site => hostname.includes(site));

            // Note: Removed content-based check as it caused false positives
            // Failed extractions are handled gracefully by toast in converter.js
        }

        // Fetch article: disabled on restricted schemes OR known SPAs OR no readable content
        chrome.contextMenus.update("fetch-article", {
            enabled: !isRestrictedScheme && !isSpaPage
        });

        // Convert page: hidden if already converted
        chrome.contextMenus.update("convert-page", {
            visible: !state.pageConverted,
            enabled: !isRestrictedScheme
        });

        // Undo: visible only if there's history
        chrome.contextMenus.update("undo-conversion", {
            visible: state.hasHistory,
            enabled: !isRestrictedScheme,
            title: UI_STRINGS.contextMenus.undo
        });
    }).catch(() => {
        // Tab error, keep defaults
    });
}

// --- Robust Content Script Injection ---
// Ensures content scripts are always present and responsive
async function ensureContentScriptInjected(tabId, forceReinject = false) {
    try {
        // First check if tab is accessible
        const tab = await chrome.tabs.get(tabId).catch(() => null);
        if (!tab || tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://') ||
            tab.url?.startsWith('chrome-extension://') || tab.url?.startsWith('about:')) {
            return false; // Restricted tab
        }

        // Check if already injected
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => typeof window.TL_CS_Injected !== 'undefined' && window.TL_CS_Injected === true
        });

        const isInjected = results?.[0]?.result;

        if (!isInjected || forceReinject) {
            // Reset the flag first if force re-injecting
            if (forceReinject) {
                await chrome.scripting.executeScript({
                    target: { tabId },
                    func: () => { window.TL_CS_Injected = undefined; }
                }).catch(() => { });
            }

            await chrome.scripting.executeScript({
                target: { tabId },
                files: ['ui_config.js', 'turndown.js', 'turndown-plugin-gfm.js', 'converter.js', 'content_script.js']
            });
            return true;
        }
        return false; // Already injected
    } catch (e) {
        // Tab might be restricted or closed
        // console.log(`Cannot inject into tab ${tabId}:`, e.message);
        return false;
    }
}

// --- SPA Navigation Handlers ---
// Handle history state changes (React Router, Next.js, Vue Router, etc.)
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.frameId === 0) { // Main frame only
        ensureContentScriptInjected(details.tabId);
        updateContextMenus(details.tabId);
    }
});

// Handle hash/fragment changes
chrome.webNavigation.onReferenceFragmentUpdated.addListener((details) => {
    if (details.frameId === 0) {
        ensureContentScriptInjected(details.tabId);
        updateContextMenus(details.tabId);
    }
});

// Handle completed navigations (including same-document navigations)
chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.frameId === 0) {
        ensureContentScriptInjected(details.tabId);
        updateContextMenus(details.tabId);
    }
});


// Auto-convert state
let isAutoConvertMode = false;

function injectAndRun(tabId, funcName) {
    // For fetchArticleContent, always ensure Readability is loaded
    const needsReadability = funcName === 'fetchArticleContent';

    // Check if script is already injected to avoid re-declaration errors
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (checkReadability) => ({
            hasConverter: typeof window.TL_Converter !== 'undefined',
            hasReadability: !checkReadability || typeof Readability !== 'undefined',
            hasTurndown: typeof window.TurndownService !== 'undefined'
        }),
        args: [needsReadability]
    }, (results) => {
        if (chrome.runtime.lastError) {
            // Tab might be closed or restricted (e.g. chrome://)
            console.warn(`Cannot access tab ${tabId}:`, chrome.runtime.lastError.message);
            return;
        }

        const status = results?.[0]?.result || { hasConverter: false, hasReadability: false, hasTurndown: false };

        if (status.hasConverter && status.hasReadability && status.hasTurndown) {
            runConverterFunc(tabId, funcName);
        } else {
            // Inject missing scripts
            const filesToInject = [];
            if (!status.hasReadability) filesToInject.push('readability.js');
            if (!status.hasTurndown) filesToInject.push('turndown.js', 'turndown-plugin-gfm.js');
            if (!status.hasConverter) filesToInject.push('ui_config.js', 'converter.js');

            if (filesToInject.length > 0) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: filesToInject
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error(`Script injection failed for tab ${tabId}:`, chrome.runtime.lastError.message);
                        return;
                    }
                    runConverterFunc(tabId, funcName);
                });
            } else {
                runConverterFunc(tabId, funcName);
            }
        }
    });
}

function runConverterFunc(tabId, funcName) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (name) => {
            if (window.TL_Converter && window.TL_Converter[name]) {
                window.TL_Converter[name]();
            }
        },
        args: [funcName]
    }, () => {
        if (chrome.runtime.lastError) {
            console.error(`Function ${funcName} execution failed:`, chrome.runtime.lastError.message);
        }
    });
}

// Auto-convert on page load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        if (isAutoConvertMode) {
            injectAndRun(tabId, 'convertPageContent');
        }
    }
});

// Sync on Tab Activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    updateContextMenus(activeInfo.tabId);

    // Test if content script is responsive, re-inject if not
    try {
        const response = await chrome.tabs.sendMessage(activeInfo.tabId, { type: "TL_EXTENSION_PING" });
        if (!response?.pong) {
            // Not responding correctly, re-inject
            await ensureContentScriptInjected(activeInfo.tabId, true);
        }
    } catch (e) {
        // Content script not responding, re-inject
        await ensureContentScriptInjected(activeInfo.tabId, true);
    }

});



chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab.id) return;

    if (info.menuItemId === "convert-page") {
        isAutoConvertMode = true;
        injectAndRun(tab.id, "convertPageContent");
        // Broadcast state change to sidepanels
        chrome.runtime.sendMessage({
            type: "AUTO_CONVERT_STATE_CHANGED",
            enabled: true
        }).catch(() => { });
    } else if (info.menuItemId === "undo-conversion") {
        isAutoConvertMode = false;
        injectAndRun(tab.id, "undoAll");
        // Broadcast state change to sidepanels
        chrome.runtime.sendMessage({
            type: "AUTO_CONVERT_STATE_CHANGED",
            enabled: false
        }).catch(() => { });
    } else if (info.menuItemId === "fetch-article") {
        // Check if this is a blocked site
        const url = tab?.url || '';
        const isRestrictedScheme = !url ||
            url.startsWith('chrome://') ||
            url.startsWith('chrome-extension://') ||
            url.startsWith('edge://') ||
            url.startsWith('about:') ||
            url.startsWith('moz-extension://') ||
            url.startsWith('devtools://');

        let isSpaPage = false;
        if (!isRestrictedScheme) {
            try {
                const hostname = new URL(url).hostname;
                const knownSpaSites = [
                    'gemini.google.com', 'chat.openai.com', 'chatgpt.com', 'claude.ai', 'grok.x.ai', 'x.ai',
                    'facebook.com', 'www.facebook.com', 'twitter.com', 'x.com',
                    'instagram.com', 'www.instagram.com', 'threads.net', 'www.threads.net',
                    'linkedin.com', 'www.linkedin.com', 'web.whatsapp.com', 'discord.com',
                    'slack.com', 'web.line.me', 'keep.google.com', 'mail.google.com',
                    'docs.google.com', 'drive.google.com', 'calendar.google.com',
                    'accounts.google.com', 'myaccount.google.com'
                ];
                isSpaPage = knownSpaSites.some(site => hostname.includes(site));
            } catch (e) { }
        }

        if (isRestrictedScheme || isSpaPage) {
            // Open sidepanel and send blocked site error
            chrome.sidePanel.open({ tabId: tab.id });
            chrome.runtime.sendMessage({
                type: 'TL_EXTENSION_FETCH_ERROR',
                errorType: 'BLOCKED_SITE'
            }).catch(() => { });
        } else {
            // Open the side panel first
            chrome.sidePanel.open({ tabId: tab.id });
            injectAndRun(tab.id, "fetchArticleContent");
        }
    } else if (info.menuItemId === "clear-text") {
        // Send clear text message to sidepanel
        chrome.runtime.sendMessage({
            type: "CLEAR_TEXT_FIELDS"
        }).catch(() => { });
    }
});
