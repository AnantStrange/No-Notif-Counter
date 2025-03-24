console.log("🔥 Background script loaded!");

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

function initializeExtension() {
    console.debug("🔄 Running initialization...");
    browserAPI.storage.sync.set({ enabled: true });

    browserAPI.tabs.query({}, function(tabs) {
        console.debug(`🔍 Found ${tabs.length} tabs`);
        if (tabs.length === 0) {
            console.debug("⚠️ No tabs found. Brave might not have restored them yet.");
        }
        for (let tab of tabs) {
            if (tab.url && tab.url.startsWith("http")) {
                console.debug(`📌 Processing tab: ${tab.id}, URL: ${tab.url}`);
                runScriptOnTab(tab.id);
            }
        }
    });
}

function waitForTabsReady(attempts = 10) {
    chrome.tabs.query({}, function(tabs) {
        if (tabs.length > 0 || attempts <= 0) {
            console.debug(`🎯 Found ${tabs.length} tabs, initializing...`);
            initializeExtension();
        } else {
            console.debug(`⏳ Waiting for tabs... (${attempts} attempts left)`);
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
    console.debug(`runScriptOnTab called for tabId: ${tabId}`);

    const blockedSchemes = ["chrome://", "brave://", "about://"];
    if (!tabUrl || blockedSchemes.some(scheme => tabUrl.startsWith(scheme))) {
        console.debug(`Skipping internal page: ${tabUrl}`);
        return;
    }

    try {
        await browserAPI.tabs.get(tabId);
    } catch (error) {
        console.debug(`⚠️ Tab ${tabId} does not exist or was closed.`);
        return;
    }

    browserAPI.storage.sync.get(['enabled','whitelist', 'blacklist', 'mode'], ({ enabled }) => {
        if (!enabled) {
            console.debug(`Extension is disabled. Not running script on tab ${tabId}`);
            return;
        }

        let shouldRun = false;
        if (mode === "whitelist") {
            shouldRun = whitelist?.split(',').map(url => url.trim()).some(url => tabUrl.includes(url));
        } else {
            shouldRun = !blacklist?.split(',').map(url => url.trim()).some(url => tabUrl.includes(url));
        }

        if (!shouldRun) {
            console.debug(`🚫 Skipping tab ${tabId} (${tabUrl}) due to whitelist/blacklist settings.`);
            return;
        }

        if (browserAPI.scripting) {
            console.debug(`Using browserAPI.scripting for tab ${tabId}`);
            browserAPI.scripting.executeScript({
                target: { tabId },
                function: removeNotificationCounter
            }).catch(err => console.debug("Fallback to tabs.executeScript:", err));
        } else {
            console.debug(`Using browserAPI.tabs.executeScript for tab ${tabId}`);
            browserAPI.tabs.executeScript(tabId, { code: '(' + removeNotificationCounter.toString() + ')();' });
        }
    });
}

// function to remove '(x)' from the beginning of a tab's title
function removeNotificationCounter() {
    let title = document.title;

    let l = title.indexOf('(')
    let r = title.indexOf(')')
    if (l !== -1 && r !== -1 && l < r) {
        toRemove = title.slice(l, r + 1)
        title = title.replace(toRemove, "").replace("  ", " ").trim()
    }

    document.title = title;
}
