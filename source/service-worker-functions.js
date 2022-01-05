import { getOptions } from './storage.js';
import { MENU_ITEMS } from './constants.js';

// TODO: Firefox does not support Manifest v3 yet
// const sidebarSupported = 'sidebarAction' in chrome;

// TODO: getMessage() is not supported in MV3: https://github.com/w3c/webextensions/issues/93
// Hardcode these for now...
const i18n = {
  // contextMenu_checkNow: chrome.i18n.getMessage('contextMenu_checkNow'),
  // contextMenu_sidebar: chrome.i18n.getMessage('contextMenu_sidebar'),
  // contextMenu_noSidebar: chrome.i18n.getMessage('contextMenu_noSidebar'),
  // badge_error: chrome.i18n.getMessage('badge_error'),

  contextMenu_checkNow: 'Check now',
  contextMenu_sidebar: 'Open FreshRSS in sidebar',
  contextMenu_noSidebar: 'Open FreshRSS page',
  badge_error: 'ERR',
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

const openFreshRssPage = async () => {
  const { url } = await getOptions();
  chrome.tabs.create({ url });
};

// const openFreshRssInSidebar = async () => {
//   const { url } = await getOptions();
//   await chrome.sidebarAction.open();
//   chrome.sidebarAction.setPanel({
//     panel: url,
//   });
// };

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
  const { apiKey, url } = await getOptions();

  if (apiKey === '' || url === '') {
    chrome.runtime.openOptionsPage();
  } else {
    setBadge(BADGE_COLORS.NORMAL, '');
    openFreshRssPage();
  }
};

export const onInstalled = () => {
  chrome.contextMenus.create({
    id: MENU_ITEMS.checkNow,
    title: i18n.contextMenu_checkNow,
    contexts: ['action'],
  });
  checkFeeds();
};