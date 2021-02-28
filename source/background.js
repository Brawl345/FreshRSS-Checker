'use strict';

const freshRssChecker = () => {

  const i18n = {
    contextMenu_checkNow: browser.i18n.getMessage('contextMenu_checkNow'),
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

  const openFreshRssPage = () => {
    if (OPTIONS.url !== '') {
      browser.browserAction.setBadgeText({ text: '' });
      browser.tabs.create({ url: OPTIONS.url });
    } else {
      browser.runtime.openOptionsPage();
    }
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
      id: 'freshrss-checker@brawl345.github.com__browserAction_contextMenu',
      title: i18n.contextMenu_checkNow,
      contexts: ['browser_action'],
      onclick: checkFeeds
    });
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

  return ({
    init: async () => {
      setBadge(BADGE_COLORS.NORMAL, '');
      await loadOptions();

      browser.alarms.onAlarm.addListener(checkFeeds);
      browser.browserAction.onClicked.addListener(openFreshRssPage);
      browser.runtime.onMessage.addListener(handleInitMessage);

      if (OPTIONS.url === '') {
        setBadge(BADGE_COLORS.WARNING, '!');
      } else {
        setup();
      }
    },
  });
};

freshRssChecker().init();
