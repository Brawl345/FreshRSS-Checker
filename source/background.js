'use strict';

const freshRssChecker = () => {

  const sidebarSupported = ('sidebarAction' in browser);

  const i18n = {
    contextMenu_checkNow: browser.i18n.getMessage('contextMenu_checkNow'),
    contextMenu_sidebar: browser.i18n.getMessage('contextMenu_sidebar'),
    contextMenu_noSidebar: browser.i18n.getMessage('contextMenu_noSidebar'),
    badge_error: browser.i18n.getMessage('badge_error')
  };

  const BADGE_COLORS = {
    NORMAL: 'blue',
    WARNING: 'yellow',
    FAILURE: 'red',
  };

  const OPTIONS = {
    url: '',
    api_key: '',
    interval: 5.0,
    sidebar: false,
  };

  const loadOptions = async () => {
    const userOptions = await browser.storage.local.get(OPTIONS);

    for (const key in userOptions) {
      OPTIONS[key] = userOptions[key];
    }
  };

  const setBadge = (color, text) => {
    browser.browserAction.setBadgeBackgroundColor({ color: color });
    browser.browserAction.setBadgeText({ text: text });
  };

  const handleBrowserAction = async () => {
    if (OPTIONS.url !== '') {
      browser.browserAction.setBadgeText({ text: '' });
      OPTIONS.sidebar === true ? openFreshRssInSidebar() : openFreshRssPage();
    } else {
      browser.runtime.openOptionsPage();
    }
  };

  const openFreshRssPage = async () => {
    browser.tabs.create({ url: OPTIONS.url });
  };

  const openFreshRssInSidebar = async () => {
    await browser.sidebarAction.open();
    browser.sidebarAction.setPanel({
      panel: OPTIONS.url
    });
  };

  const checkFeeds = async function () {
    const api_url = OPTIONS.url + 'api/fever.php?api&unread_item_ids';
    const formData = new FormData();
    formData.append('api_key', OPTIONS.api_key);

    let body = {};
    try {
      const response = await fetch(api_url, { method: 'POST', body: formData });
      body = await response.json();
    } catch (err) {
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

  const setup = async () => {
    await checkFeeds();
    browser.alarms.create('freshrss-checker@brawl345.github.com__alarm', {
      periodInMinutes: OPTIONS.interval,
    });
    await browser.contextMenus.removeAll();
    browser.contextMenus.create({
      id: 'freshrss-checker@brawl345.github.com__browserAction_contextMenu_checkNow',
      title: i18n.contextMenu_checkNow,
      contexts: ['browser_action'],
      onclick: checkFeeds
    });

    if (sidebarSupported === true) {

      if (OPTIONS.sidebar === true) {
        browser.contextMenus.create({
          id: 'freshrss-checker@brawl345.github.com__browserAction_contextMenu_openPage',
          title: i18n.contextMenu_noSidebar,
          contexts: ['browser_action'],
          onclick: openFreshRssPage
        });
      } else {
        browser.contextMenus.create({
          id: 'freshrss-checker@brawl345.github.com__browserAction_contextMenu_openSidebar',
          title: i18n.contextMenu_sidebar,
          contexts: ['browser_action'],
          onclick: openFreshRssInSidebar
        });
      }

    }
  };

  const handleInitMessage = async (request) => {
    if (request !== 'init') {
      return;
    }
    setBadge(BADGE_COLORS.NORMAL, '');

    await loadOptions();
    if (OPTIONS.url === '') {
      setBadge(BADGE_COLORS.WARNING, '!');
    } else {
      setup();
    }
  };

  const init = async () => {
    setBadge(BADGE_COLORS.NORMAL, '');
    await loadOptions();

    browser.alarms.onAlarm.addListener(checkFeeds);
    browser.browserAction.onClicked.addListener(handleBrowserAction);
    browser.runtime.onMessage.addListener(handleInitMessage);

    if (OPTIONS.url === '') {
      setBadge(BADGE_COLORS.WARNING, '!');
    } else {
      setup();
    }
  };

  return init();
};

freshRssChecker();
