// INITIALIZATION

// get the toggle element (toggles the extension functionality on/off)
let toggle = document.getElementById('toggle');

// set the value of the toggle switch to the value stored in the browser
chrome.storage.sync.get('enabled', ({enabled}) => {
    toggle.checked = enabled;
});
reportStatus('opened popup');


// LISTENERS

toggle.addEventListener('change', async () => {

    if(toggle.checked) { // changed to true
        // set toggle value to true
        chrome.storage.sync.set({enabled: true});
        reportStatus('toggled on');
        
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
                
    } else { // changed to false
        // set toggle value to false
        chrome.storage.sync.set({enabled: false});
        reportStatus('toggled off');
    }
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

// reports action and whether or not the extension is enabled or not
function reportStatus(msg) {
    chrome.storage.sync.get(['enabled'], ({enabled}) => {
        console.log({'status': msg, 'enabled': enabled});
    });
}
