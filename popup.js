let toggle = document.getElementById('toggle');
chrome.storage.sync.get('enabled', ({enabled}) => {
    toggle.checked = enabled
});

toggle.addEventListener('change', () => {
    if(this.checked) {
        let enabled = true;
        chrome.storage.sync.set({enabled});
    } else {
        let enabled = false;
        chrome.storage.sync.set({enabled});
    }
});