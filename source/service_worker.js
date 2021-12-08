import {
  checkFeeds,
  onClickIcon,
  onInstalled,
  setupAlarm,
} from './service_worker_functions.js';
import { MENU_ITEMS } from './constants.js';
import { getOptions } from './storage.js';

chrome.runtime.onInstalled.addListener(onInstalled);
chrome.runtime.onStartup.addListener(checkFeeds);
chrome.action.onClicked.addListener(onClickIcon);
chrome.alarms.onAlarm.addListener(checkFeeds);
chrome.contextMenus.onClicked.addListener(({ menuItemId }) => {
  switch (menuItemId) {
    case MENU_ITEMS.checkNow:
      checkFeeds();
      break;
    default:
      break;
  }
});

chrome.storage.sync.onChanged.addListener(({ apiKey, interval, url }) => {
  if (interval) {
    setupAlarm(interval.newValue);
  }
  if (apiKey || url) {
    checkFeeds();
  }
});

getOptions().then(({ apiKey, interval, url }) => {
  if (apiKey !== '' && url !== '') {
    setupAlarm(interval);
  }
});
