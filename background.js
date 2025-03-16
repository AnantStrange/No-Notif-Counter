console.log("🔥 Background script loaded!");

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

function initializeExtension() {
    console.log("🔄 Running initialization...");
    browserAPI.storage.sync.set({ enabled: true });

    browserAPI.tabs.query({}, function(tabs) {
        console.log(`🔍 Found ${tabs.length} tabs`);
        if (tabs.length === 0) {
            console.warn("⚠️ No tabs found. Brave might not have restored them yet.");
        }
        for (let tab of tabs) {
            if (tab.url && tab.url.startsWith("http")) {
                console.log(`📌 Processing tab: ${tab.id}, URL: ${tab.url}`);
                runScriptOnTab(tab.id);
            }
        }
    });
}

function waitForTabsReady(attempts = 10) {
    chrome.tabs.query({}, function(tabs) {
        if (tabs.length > 0 || attempts <= 0) {
            console.log(`🎯 Found ${tabs.length} tabs, initializing...`);
            initializeExtension();
        } else {
            console.log(`⏳ Waiting for tabs... (${attempts} attempts left)`);
            setTimeout(() => waitForTabsReady(attempts - 1), 500);
        }
    });
}

waitForTabsReady();

// Listneners
// Runs on new or updated tabs
browserAPI.tabs.onCreated.addListener((tab) => runScriptOnTab(tab.id, tab.url));
browserAPI.tabs.onUpdated.addListener((tabId, changeInfo, tab) => runScriptOnTab(tabId, tab.url));

async function runScriptOnTab(tabId, tabUrl) {
    console.log(`runScriptOnTab called for tabId: ${tabId}`);
    // Skip internal browser pages
    const blockedSchemes = ["chrome://", "brave://", "about://"];
    if (!tabUrl || blockedSchemes.some(scheme => tabUrl.startsWith(scheme))) {
        console.log(`Skipping internal page: ${tabUrl}`);
        return;
    }

    browserAPI.storage.sync.get(['enabled'], ({ enabled }) => {
        if (enabled) {
            if (browserAPI.scripting) {
                console.log(`Using browserAPI.scripting for tab ${tabId}`);
                browserAPI.scripting.executeScript({
                    target: { tabId },
                    function: removeNotificationCounter
                }).catch(err => console.warn("Fallback to tabs.executeScript:", err));
            } else {
                console.log(`Using browserAPI.tabs.executeScript for tab ${tabId}`);
                browserAPI.tabs.executeScript(tabId, { code: '(' + removeNotificationCounter.toString() + ')();' });
            }
        } else {
            console.warn(`Extension is disabled. Not running script on tab ${tabId}`);
        }
    });
}

// function to remove '(x)' from the beginning of a tab's title
function removeNotificationCounter() {
    console.log("Me is Working !!!")
    let title = document.title;

    let l = title.indexOf('(')
    let r = title.indexOf(')')
    if (l !== -1 && r !== -1 && l < r) {
        toRemove = title.slice(l, r + 1)
        title = title.replace(toRemove, "").replace("  ", " ").trim()
    }

    document.title = title;
}
