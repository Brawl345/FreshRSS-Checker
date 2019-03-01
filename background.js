var defaults = {
    'interval': 5,
    'password': '',
    'url': '',
    'username': '',
}

async function setDefaults() {
    var settingsNames = Object.getOwnPropertyNames(defaults);
    var settings = await browser.storage.local.get(settingsNames);

    var val;
    for (let setting in defaults) {
        if (defaults.hasOwnProperty(setting)) {
            if (settings[setting] === undefined) {
                val = defaults[setting];
            } else {
                val = settings[setting];
            }
            settings[setting] = val;
        }
    }
    browser.storage.local.set(settings);
}

function sanitizeInterval(settings) {
    var interval;
    if (settings.hasOwnProperty('interval')) {
        interval = settings.interval;
    } else {
        interval = '';
    }
    return interval ? parseFloat(interval) : 1.0;
}

async function checkFeeds() {
    var loginInfo = ['url', 'username', 'password'];
    var info = await browser.storage.local.get([...loginInfo]);
    // Need non-empty values for all the login settings to run alarm
    if (loginInfo.some(el => !info[el])) {
        return;
    }

    var api_url = info.url + 'api/fever.php?api&unread_item_ids';
    var formdata = new FormData();
    var api_key = md5(info.username + ':' + info.password);
    formdata.append('api_key', api_key);
    
    try {
        var response = await fetch(api_url, {method: 'POST', body: formdata});
        var body = await response.json();
    } catch(err) {
        browser.browserAction.setBadgeText({'text': "ERR"});
        browser.browserAction.setBadgeBackgroundColor({'color': 'red'});
        return;
    }
    if (body.auth == 0) {
        browser.browserAction.setBadgeText({'text': "ERR"});
        browser.browserAction.setBadgeBackgroundColor({'color': 'red'});
        return;
    }

    var unread_item_ids = body.unread_item_ids.split(",");
    browser.browserAction.setBadgeBackgroundColor({'color': 'blue'});
    if (unread_item_ids.length === 1 && unread_item_ids[0] === "") {
        browser.browserAction.setBadgeText({'text': ""});
    } else {
        browser.browserAction.setBadgeText({'text': unread_item_ids.length.toString()});
    }
}

async function calculateDelay(interval) {
    var alarm = await browser.alarms.get('freshrss-check');

    var newDelay;
    if (typeof alarm !== 'undefined') {
        var currentDelay = (alarm.scheduledTime - Date.now()) / 60;
        newDelay = Math.max(interval - currentDelay, 0);
    } else {
        newDelay = 0;
    }

    return newDelay;
}

function handleAlarm(alarm) {
    if (alarm.name === 'freshrss-check') {
        checkFeeds();
    }
}

async function setupAlarm() {
    var loginInfo = ['url', 'username', 'password'];
    var settings = await browser.storage.local.get(['interval', ...loginInfo]);

    // Need non-empty values for all the login settings to run alarm
    if (loginInfo.some(el => !settings[el])) {
        return;
    }

    var interval = sanitizeInterval(settings);
    var delay = await calculateDelay(interval);

    browser.alarms.create('freshrss-check', {'delayInMinutes': delay, 'periodInMinutes': interval});
}

async function onClicked(actionInfo) {
    var settings = await browser.storage.local.get(['url']);
    if (!settings.url) {
        return;
    }
    browser.browserAction.setBadgeText({'text': ""});
    browser.tabs.create({url: `${settings.url}`});
}

setDefaults();
browser.browserAction.setBadgeBackgroundColor({'color': 'blue'});
browser.browserAction.onClicked.addListener(onClicked);
setupAlarm();
browser.alarms.onAlarm.addListener(handleAlarm);

browser.contextMenus.create({
    id: 'freshrss-check-manually',
    title: 'Check now',
    contexts: ['browser_action']
});
browser.contextMenus.onClicked.addListener(checkFeeds);
