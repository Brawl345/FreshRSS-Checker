var optionNames = ['interval','password', 'url', 'username']

async function saveOptions(e) {
    e.preventDefault()
    var settings = {}
    var element
    for (let setting of optionNames) {
        element = document.querySelector('#'+setting)
        if (element.type == 'checkbox') {
            settings[setting] = element.checked
        } else {
            settings[setting] = element.value
        }
    }
    
    // Ask for permission
    if (settings.url !== "") {
        settings.url = settings.url.replace(/\/?$/, '/');
        var granted = await requestHostPermission(settings.url);
        if (!granted) {
          delete settings.url;
        }
    }
    
    browser.storage.local.set(settings);
    var background = browser.extension.getBackgroundPage()
    background.setupAlarm();
}

async function restoreOptions() {
    var settings = await browser.storage.local.get(optionNames)

    var element
    for (let setting in settings) {
        element = document.querySelector('#'+setting)
        if (element.type == 'checkbox') {
            element.checked = settings[setting]
        } else {
            element.value = settings[setting]
        }
    }
}

function requestHostPermission(url) {
    return browser.permissions.request({origins: [url]});
}

async function removeHostPermission() {
    var all_permissions = await browser.permissions.getAll();
    if (all_permissions.origins.length > 0) {
        browser.permissions.remove({origins: [...all_permissions.origins]});
    }
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#save').addEventListener('submit', saveOptions);
document.querySelector('#reset-host').addEventListener('submit', removeHostPermission);