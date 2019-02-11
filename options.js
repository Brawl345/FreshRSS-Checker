var optionNames = ['interval','password', 'url', 'username']

function saveOptions(e) {
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
    browser.storage.local.set(settings)

    var background = browser.extension.getBackgroundPage()
    background.setupAlarm()
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

document.addEventListener('DOMContentLoaded', restoreOptions)
document.querySelector('#save').addEventListener('submit', saveOptions)