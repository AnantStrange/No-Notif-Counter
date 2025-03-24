let toggles = document.querySelectorAll('.toggle');
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// Load stored values dynamically for any toggle
browserAPI.storage.sync.get(null, (data) => {
    console.debug("Loaded Data:", data); // Debugging
    toggles.forEach(toggle => {
        let key = toggle.dataset.key;
        let defaultValue = toggle.dataset.valueOff; // Default to the "off" state value
        let storedValue = data[key] ?? defaultValue; // Get from storage, or use default

        updateToggleUI(toggle, storedValue);
    });

    document.getElementById('whitelist').value = data.whitelist || "";
    document.getElementById('blacklist').value = data.blacklist || "";
});

// Function to update a single toggle UI
function updateToggleUI(toggle, selectedValue) {
    let isOn = selectedValue === toggle.dataset.valueOn;
    toggle.classList.toggle('toggle--checked', isOn);

    let toggleBtns = toggle.querySelectorAll('.toggle_btn');
    toggleBtns.forEach(btn => {
        btn.classList.toggle('toggle_btn--active', 
            btn.classList.contains(isOn ? 'toggle_on' : 'toggle_off'));
    });
}

// LISTENERS
toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        let key = toggle.dataset.key;
        let newValue = toggle.classList.contains('toggle--checked') 
            ? toggle.dataset.valueOff 
            : toggle.dataset.valueOn; // Switch state

        console.debug(`Saving: ${key} = ${newValue}`); // Debugging
        browserAPI.storage.sync.set({ [key]: newValue }, () => {
            console.debug("Storage updated successfully!"); // Debugging
        });

        updateToggleUI(toggle, newValue);
    });
});


// Save settings button
document.getElementById('saveSettings').addEventListener('click', () => {
    browserAPI.storage.sync.set({
        whitelist: document.getElementById('whitelist').value.trim(),
        blacklist: document.getElementById('blacklist').value.trim()
    }, () => {
        alert('Settings saved!');
    });
});

