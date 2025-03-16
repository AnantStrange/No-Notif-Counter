// INITIALIZATION
let toggle = document.querySelector('.toggle');
let toggleBtns = document.querySelectorAll('.toggle_btn');
let whitelistInput = document.getElementById('whitelist');
let blacklistInput = document.getElementById('blacklist');
let saveButton = document.getElementById('saveSettings');
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// Load stored values
browserAPI.storage.sync.get(['enabled'], (data) => {
    let isEnabled = data.enabled ?? true;
    updateToggleUI(isEnabled);
});

// Function to update the UI based on the toggle state
function updateToggleUI(isEnabled) {
    toggle.classList.toggle('toggle--checked', isEnabled);
    
    toggleBtns.forEach(btn => {
        btn.classList.toggle('toggle_btn--active', 
            btn.classList.contains(isEnabled ? 'toggle_on' : 'toggle_off'));
    });
}

// LISTENERS

// Toggle extension ON/OFF
toggle.addEventListener('click', () => {
    let isEnabled = !toggle.classList.contains('toggle--checked');
    browserAPI.storage.sync.set({ enabled: isEnabled });
    updateToggleUI(isEnabled);
});


// Save Whitelist, Blacklist
saveButton.addEventListener('click', () => {
    browserAPI.storage.sync.set({
        whitelist: whitelistInput.value.trim(),
        blacklist: blacklistInput.value.trim(),
    }, () => {
        alert('Settings saved!');
    });
});

