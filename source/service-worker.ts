import {
  checkFeeds,
  createOpenPageMenu,
  createOpenSidebarMenu,
  onClickIcon,
  onInstalled,
  openFreshRssInSidebar,
  openFreshRssPage,
  setupAlarm,
} from './service-worker-functions';
import { getOptions } from './storage';
import { MenuItem, supportsSidebar } from './constants';

chrome.runtime.onInstalled.addListener(onInstalled);
chrome.runtime.onStartup.addListener(checkFeeds);
chrome.action.onClicked.addListener(onClickIcon);
chrome.alarms.onAlarm.addListener(checkFeeds);
chrome.contextMenus.onClicked.addListener(({ menuItemId }) => {
  switch (menuItemId) {
    case MenuItem.CheckNow: {
      checkFeeds();
      break;
    }
    case MenuItem.OpenSidebar: {
      openFreshRssInSidebar();
      break;
    }
    case MenuItem.OpenPage: {
      openFreshRssPage();
      break;
    }
    default: {
      break;
    }
  }
});

chrome.storage.sync.onChanged.addListener(({ apiKey, interval, url, sidebar }) => {
  if (interval) {
    setupAlarm(interval.newValue);
  }
  if (apiKey || url) {
    checkFeeds();
  }

  if (supportsSidebar && sidebar.oldValue !== sidebar.newValue) {
    if (sidebar.newValue) {
      // Sidebar is enabled
      chrome.contextMenus.remove(MenuItem.OpenSidebar);
      createOpenPageMenu();
    } else {
      chrome.contextMenus.remove(MenuItem.OpenPage);
      createOpenSidebarMenu();
    }
  }
});

getOptions().then(({ apiKey, interval, url }) => {
  if (apiKey !== '' && url !== '') {
    setupAlarm(interval);
  }
});
