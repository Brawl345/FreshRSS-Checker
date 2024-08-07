import { getOptions } from './storage.js';
import { MENU_ITEMS } from './constants.js';

const sidebarSupported = 'sidebarAction' in chrome;

const i18n = {
  contextMenu_checkNow: chrome.i18n.getMessage('contextMenu_checkNow'),
  contextMenu_sidebar: chrome.i18n.getMessage('contextMenu_sidebar'),
  contextMenu_noSidebar: chrome.i18n.getMessage('contextMenu_noSidebar'),
  badge_error: chrome.i18n.getMessage('badge_error'),
};

const BADGE_COLORS = {
  NORMAL: 'blue',
  WARNING: 'yellow',
  FAILURE: 'red',
};

const setBadge = (color, text) => {
  chrome.action.setBadgeBackgroundColor({ color: color });
  chrome.action.setBadgeText({ text: text });
};

export const checkFeeds = async function () {
  const { apiKey, url } = await getOptions();
  if (apiKey === '' || url === '') {
    setBadge(BADGE_COLORS.WARNING, '!');
    return;
  }
  const api = `${url}api/fever.php?api&unread_item_ids`;
  const formData = new FormData();
  formData.append('api_key', apiKey);

  let body = {};
  try {
    const response = await fetch(api, { method: 'POST', body: formData });
    body = await response.json();
  } catch (error) {
    console.error(error);
    setBadge(BADGE_COLORS.FAILURE, i18n.badge_error);
    return;
  }

  if (body.auth === 0) {
    setBadge(BADGE_COLORS.FAILURE, i18n.badge_error);
    return;
  }

  if (body.unread_item_ids === '') {
    setBadge(BADGE_COLORS.NORMAL, '');
  } else {
    const unread_item_ids = body.unread_item_ids.split(',');
    setBadge(BADGE_COLORS.NORMAL, unread_item_ids.length.toString());
  }
};

export const openFreshRssPage = async () => {
  const { url } = await getOptions();
  if (url === '') {
    chrome.runtime.openOptionsPage();
    return;
  }
  chrome.tabs.create({ url });
};

export const openFreshRssInSidebar = async () => {
  const url = localStorage.getItem('url');
  if (url === null || url === '') {
    chrome.runtime.openOptionsPage();
    return;
  }

  chrome.sidebarAction.setPanel({
    panel: url,
  });
  await chrome.sidebarAction.open();
};

export const setupAlarm = async (interval) => {
  const alarmId = 'freshrss-checker@brawl345.github.com__alarm';
  const alarm = await chrome.alarms.get(alarmId);

  if (!alarm || alarm.periodInMinutes !== interval) {
    chrome.alarms.create(alarmId, {
      periodInMinutes: interval,
    });
  }
};

export const onClickIcon = async () => {
  // Special handling for sidebar in Firefox
  if (typeof window !== 'undefined' && window.localStorage) {
    const sidebar = localStorage.getItem('sidebar');
    if (sidebar === 'true') {
      openFreshRssInSidebar();
      return;
    }
  }

  const { apiKey, url, sidebar } = await getOptions();

  if (apiKey === '' || url === '') {
    chrome.runtime.openOptionsPage();
  } else {
    setBadge(BADGE_COLORS.NORMAL, '');
    if (sidebar) {
      openFreshRssInSidebar();
    } else {
      openFreshRssPage();
    }
  }
};

export const createOpenPageMenu = () => {
  chrome.contextMenus.create({
    id: MENU_ITEMS.openPage,
    title: i18n.contextMenu_noSidebar,
    contexts: ['action'],
  });
};

export const createOpenSidebarMenu = () => {
  chrome.contextMenus.create({
    id: MENU_ITEMS.openSidebar,
    title: i18n.contextMenu_sidebar,
    contexts: ['action'],
  });
};

export const onInstalled = async () => {
  const { url, sidebar } = await getOptions();

  chrome.contextMenus.create({
    id: MENU_ITEMS.checkNow,
    title: i18n.contextMenu_checkNow,
    contexts: ['action'],
  });

  if (sidebarSupported) {
    if (sidebar) {
      createOpenPageMenu();
    } else {
      createOpenSidebarMenu();
    }
  }

  // Firefox needs user action for opening the sidebar.
  // So we will save these options to localStorage, since reading them
  // asynchronously loses the "user interaction".
  // See https://bugzilla.mozilla.org/show_bug.cgi?id=1800401
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('url', url);
    localStorage.setItem('sidebar', sidebar);
  }

  checkFeeds();
};
