console.debug("🔥 Background script loaded!");
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

function initializeExtension() {
    console.debug("🔄 Running initialization...");
    browserAPI.storage.sync.get(['extensionEnabled', 'whitelist', 'blacklist', 'mode'], (data) => {
        let defaults = {
            extensionEnabled: data.extensionEnabled ?? "true",
            whitelist: data.whitelist ?? "",   // Default: empty string
            blacklist: data.blacklist ?? "",   // Default: empty string
            mode: data.mode ?? "blacklist"     // Default: blacklist mode
        };

        browserAPI.storage.sync.set(defaults, () => {
            console.debug("✅ Initialized storage values:", defaults);
        });

    browserAPI.tabs.query({}, function(tabs) {
        console.debug(`🎯 Found ${tabs.length} tabs, initializing...`);
        for (let tab of tabs) {
            if (tab.url && tab.url.startsWith("http")) {
                console.debug(`📌 Processing tab: ${tab.id}, URL: ${tab.url}`);
                runScriptOnTab(tab.id, tab.url);
            }
        }
            console.debug("End initializeExtension()");
        });
    })
}

function waitForTabsReady(attempts = 10) {
    browserAPI.tabs.query({}, function(tabs) {
        if (tabs.length > 0 || attempts <= 0) {
            initializeExtension();
        } else {
            console.debug(`⏳ Waiting for tabs... (${attempts} attempts left)`);
            setTimeout(() => waitForTabsReady(attempts - 1), 500);
        }
    });
}

waitForTabsReady();

// Listeners
browserAPI.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url && tab.url.startsWith("http")) {
        console.debug(`✅ Tab ${tabId} is ready, running script.`);
        runScriptOnTab(tabId, tab.url);
    }
});


async function runScriptOnTab(tabId, tabUrl, retries = 5) {
    console.debug(`🔄 runScriptOnTab called for tabId: ${tabId} tabUrl: ${tabUrl}`);

    browserAPI.storage.sync.get(['extensionEnabled', 'whitelist', 'blacklist', 'mode'], (data) => {
        const extensionEnabled = data?.extensionEnabled === "true";
        if (!extensionEnabled) {
            console.debug(`🚫 Extension is disabled.`);
            return;
        }
        console.debug(`whitelist : ${data.whitelist} | blacklist : ${data.blacklist} | mode = ${data.mode}`);

        const mode = data?.mode || "blacklist";
        const whitelist = data?.whitelist || "";
        const blacklist = data?.blacklist || "";
        const blockedSchemes = ["chrome://", "brave://", "about://"];

        if (!tabUrl || blockedSchemes.some(scheme => tabUrl.startsWith(scheme))) {
            console.debug(`⚠️ Skipping internal page: ${tabUrl}`);
            return;
        }

        if (!shouldRunScript(tabUrl, mode, whitelist, blacklist)) {
            console.debug(`🚫 Skipping tab ${tabId} (${tabUrl}) due to whitelist/blacklist settings.`);
            return;
        }

        if (browserAPI.scripting) {
            console.debug(`✅ Using browserAPI.scripting for tab ${tabId}`);
            browserAPI.scripting.executeScript({
                target: { tabId },
                function: removeNotificationCounter
            }).catch(err => console.debug("⚠️ Fallback to tabs.executeScript:", err));
        } else {
            try {
                console.debug(`✅ Using browserAPI.tabs.executeScript for tab ${tabId}`);
                browserAPI.tabs.executeScript(tabId, { code: '(' + removeNotificationCounter.toString() + ')();' });
            } catch (err) {
                console.debug("🚫 Error in tabs.executeScript:", err);
            }
        }
    });
}

function shouldRunScript(tabUrl, mode, whitelist, blacklist) {
    if (mode === "whitelist") {
        const allowedUrls = whitelist.split(',').map(url => url.trim()).filter(url => url);
        return allowedUrls.some(url => tabUrl.includes(url));
    }

    if (mode === "blacklist") {
        const blockedUrls = blacklist.split(',').map(url => url.trim()).filter(url => url);
        return !blockedUrls.some(url => tabUrl.includes(url));
    }

    return false;
}

// Function to remove '(x)' from the beginning of a tab's title and inject a // Observer to monitor title changes.
function removeNotificationCounter() {
    function cleanTitle() {
        const newTitle = document.title.replace(/\s*\(\d+\)\s*/, '');
        if (newTitle !== document.title) {
            document.title = newTitle;
        }
    }

    const titleElement = document.querySelector('title');
    if (!titleElement) return;

    cleanTitle(); // Run once immediately

    // Efficient observer
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === "childList") {
                cleanTitle(); // Only update if necessary
            }
        }
    });

    observer.observe(titleElement, { childList: true});
}
