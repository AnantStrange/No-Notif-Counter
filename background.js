// LISTENERS

// handles everthing at the time of installation
chrome.runtime.onInstalled.addListener(async () => {
    console.log('Extension installed');
    // set enabled to be true by default
    chrome.storage.sync.set({enabled: true});

    // get list of open tabs
    let tabs = await chrome.tabs.query({currentWindow: true});
    for(var i = 0; i < tabs.length; i++) {
        let tab = tabs[i];
        // if tab is valid site, attempt to remove counter from title
        if(tab.url.includes('https://') || tab.url.includes('http://')) {
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: removeNotificationCounter
            });
        }
    }
});

// listener for new tabs being created
chrome.tabs.onCreated.addListener(async (tab) => {
    chrome.storage.sync.get(['enabled'], ({enabled}) => {
        console.log({'change': 'create', 'enabled': enabled});
        if(enabled) {
            // attempt to remove counter
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: removeNotificationCounter
            });
        }
    });
});

// listener for tab updates (refresh, html changes, etc.)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    chrome.storage.sync.get(['enabled'], ({enabled}) => {
        console.log({'change': 'update', 'enabled': enabled});
        if(enabled) {
            // attempt to remove counter
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: removeNotificationCounter
            });
        }
    });
});


// FUNCTIONS

// function to remove '(x)' from the beginning of a tab's title
function removeNotificationCounter() {
    let title = document.title;
    if(title[0] === '(' && title.includes(')')) {
        let idx = title.indexOf(')');
        title = title.slice(idx+1).trim();
    }
    document.title = title;
}
