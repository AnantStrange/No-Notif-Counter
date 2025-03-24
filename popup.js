// INITIALIZATION
let toggle = document.querySelector('.toggle');
let toggleBtns = document.querySelectorAll('.toggle_btn');
let whitelistInput = document.getElementById('whitelist');
let blacklistInput = document.getElementById('blacklist');
let saveButton = document.getElementById('saveSettings');
let modeWhitelist = document.getElementById('whitelist_mode');
let modeBlacklist = document.getElementById('blacklist_mode');
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// Load stored values
browserAPI.storage.sync.get(['enabled', 'whitelist', 'blacklist', 'mode'], (data) => {
    let isEnabled = data.enabled ?? true;
    updateToggleUI(isEnabled);

    whitelistInput.value = data.whitelist || "";
    blacklistInput.value = data.blacklist || "";

    // Default to blacklist mode if mode is undefined or incorrect
    if (data.mode === "whitelist") {
        modeWhitelist.checked = true;
        modeBlacklist.checked = false;
    } else{
        modeWhitelist.checked = false;
        modeBlacklist.checked = true;
    }

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
    let selectedMode = modeWhitelist.checked ? "whitelist" : "blacklist";
    browserAPI.storage.sync.set({
        whitelist: whitelistInput.value.trim(),
        blacklist: blacklistInput.value.trim(),
        mode: selectedMode
    }, () => {
        alert('Settings saved!');
    });
});

