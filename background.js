chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
    let enabled = true;
    chrome.storage.sync.set({enabled});
});

chrome.tabs.onCreated.addListener(async (tab) => {
    console.log('Tab created');
    chrome.storage.sync.get('enabled', ({enabled}) => {
        if(enabled === true) {
            console.log('updating title');
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: removeNotificationCounter
            });
        }
    });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    console.log('Tab updated');
    chrome.storage.sync.get('enabled', ({enabled}) => {
        console.log(enabled);
        if(enabled === true) {
            console.log('updating title');
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: removeNotificationCounter
            });
        }
    });
});

// function to remove '(x)' from the beginning of a tab's title
function removeNotificationCounter() {
    let title = document.title;
    if(title[0] === '(' && title.includes(')')) {
        let idx = title.indexOf(')');
        title = title.slice(idx+1).trim();
    }
    document.title = title;
}
