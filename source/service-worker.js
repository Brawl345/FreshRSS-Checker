import {
  checkFeeds,
  createOpenPageMenu,
  createOpenSidebarMenu,
  onClickIcon,
  onInstalled,
  openFreshRssInSidebar,
  openFreshRssPage,
  setupAlarm,
} from './service-worker-functions.js';
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
    case MENU_ITEMS.openSidebar:
      openFreshRssInSidebar();
      break;
    case MENU_ITEMS.openPage:
      openFreshRssPage();
      break;
    default:
      break;
  }
});

chrome.storage.sync.onChanged.addListener(
  ({ apiKey, interval, url, sidebar }) => {
    if (interval) {
      setupAlarm(interval.newValue);
    }
    if (apiKey || url) {
      checkFeeds();
    }
    if (sidebar.oldValue !== sidebar.newValue) {
      if (sidebar.newValue) {
        // Sidebar is enabled
        chrome.contextMenus.remove(MENU_ITEMS.openSidebar);
        createOpenPageMenu();
      } else {
        chrome.contextMenus.remove(MENU_ITEMS.openPage);
        createOpenSidebarMenu();
      }
    }
  }
);

getOptions().then(({ apiKey, interval, url }) => {
  if (apiKey !== '' && url !== '') {
    setupAlarm(interval);
  }
});
