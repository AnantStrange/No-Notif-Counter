let toggle = document.getElementById('toggle');
chrome.storage.sync.get('enabled', ({enabled}) => {
    toggle.checked = enabled;
});
reportStatus();

toggle.addEventListener('change', () => {
    console.log('checked:' + toggle.checked);

    if(toggle.checked) {
        chrome.storage.sync.set({enabled: true});
        reportStatus();
        
        // let tabs = await chrome.tabs.query({currentWindow: true});
        // for(var i = 0; i < tabs.length; i++) {
            //     chrome.scripting.executeScript({
                //         target: {tabId: tab.id},
                //         function: removeNotificationCounter
                //     });
                // }
                
    } else {
        chrome.storage.sync.set({enabled: false});
        reportStatus();
    }
});

// // function to remove '(x)' from the beginning of a tab's title
// function removeNotificationCounter() {
//     let title = document.title;
//     if(title[0] === '(' && title.includes(')')) {
//         let idx = title.indexOf(')');
//         title = title.slice(idx+1).trim();
//     }
//     document.title = title;
// }

function reportStatus() {
    chrome.storage.sync.get(['enabled'], ({enabled}) => {
        console.log('enabled: ' + enabled);
    });
}