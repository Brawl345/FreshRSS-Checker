'use strict';

/* global SparkMD5 */

const freshRssCheckerOptions = () => {

  const i18n = {
    title: browser.i18n.getMessage('options_title'),
    extensionName: browser.i18n.getMessage('extensionName'),
    urlLabel: browser.i18n.getMessage('options_freshRssUrlLabel'),
    urlPlaceholder: browser.i18n.getMessage('options_freshRssUrlPlaceholder'),
    usernameLabel: browser.i18n.getMessage('options_freshRssUsernameLabel'),
    usernamePlaceholder: browser.i18n.getMessage('options_freshRssUsernamePlaceholder'),
    passwordLabel: browser.i18n.getMessage('options_freshRssPasswordLabel'),
    passwordPlaceholder: browser.i18n.getMessage('options_freshRssPasswordPlaceholder'),
    intervalLabel: browser.i18n.getMessage('options_intervalLabel'),
    intervalPlaceholder: browser.i18n.getMessage('options_intervalPlaceholder'),
    save: browser.i18n.getMessage('options_save'),
    removePermissions: browser.i18n.getMessage('options_removePermissions'),
    hostsLabel: browser.i18n.getMessage('options_hostsLabel'),
    hostsPlaceholder: browser.i18n.getMessage('options_hostsPlaceholder'),
    permissionsCleared: browser.i18n.getMessage('options_permissionsCleared'),
    permissionNotGranted: browser.i18n.getMessage('options_permissionNotGranted'),
    saveSuccess: browser.i18n.getMessage('options_saveSuccess'),
    saveFail: browser.i18n.getMessage('options_saveFail'),
  };

  const HTML = {
    title: document.getElementById('title'),
    url: document.getElementById('url'),
    username: document.getElementById('username'),
    password: document.getElementById('password'),
    interval: document.getElementById('interval'),
    save: document.getElementById('save'),
    message: document.getElementById('message'),
    removePermissionsBtn: document.getElementById('remove-permissions'),
    hostsLabel: document.getElementById('hosts-label'),
    hosts: document.getElementById('hosts'),
  };

  const OPTIONS = {
    url: '',
    username: '',
    password: '',
    interval: 5.0,
  };

  const localize = () => {
    document.title = i18n.title;
    HTML.title.textContent = i18n.extensionName;

    HTML.url.previousSibling.textContent = i18n.urlLabel;
    HTML.url.placeholder = i18n.urlPlaceholder;
    HTML.username.previousSibling.textContent = i18n.usernameLabel;
    HTML.username.placeholder = i18n.usernamePlaceholder;
    HTML.password.previousSibling.textContent = i18n.passwordLabel;
    HTML.password.placeholder = i18n.passwordPlaceholder;
    HTML.interval.previousSibling.textContent = i18n.intervalLabel;
    HTML.interval.placeholder = i18n.intervalPlaceholder;

    HTML.save.textContent = i18n.save;
    HTML.removePermissionsBtn.textContent = i18n.removePermissions;
    HTML.hostsLabel.textContent = i18n.hostsLabel;
    HTML.hosts.placeholder = i18n.hostsPlaceholder;
  };

  const clearMessage = () => {
    HTML.message.style.display = 'none';
    HTML.message.className = '';
  };

  const setMessage = (variant, text) => {
    HTML.message.textContent = text;
    HTML.message.className = variant;
    HTML.message.style.display = 'block';
    setTimeout(clearMessage, 2000);
  };

  const restoreOptions = async () => {
    const userOptions = await browser.storage.local.get(OPTIONS);
    for (const key in userOptions) {
      const htmlElement = document.getElementsByName(key)[0];
      htmlElement.value = userOptions[key];
    }
  };

  const removeHostPermissions = async () => {
    const all_permissions = await browser.permissions.getAll();
    if (all_permissions.origins.length > 0) {
      await browser.permissions.remove({ origins: [...all_permissions.origins] });
    }
    await reloadHostsTextField();
    setMessage('success', i18n.permissionsCleared);
  };

  const reloadHostsTextField = async () => {
    HTML.hosts.value = (await browser.permissions.getAll()).origins.join('\n');
  };

  const saveOptions = async (event) => {
    event.preventDefault();
    const userOptions = {};
    Object.assign(userOptions, OPTIONS);

    for (const key in userOptions) {
      const htmlElement = document.getElementsByName(key)[0];

      switch (htmlElement.type) {
      case 'number':
        userOptions[key] = parseInt(htmlElement.value);
        break;
      case 'url':
        userOptions[key] = htmlElement.value.replace(/\/?$/, '/');
        break;
      default:
        userOptions[key] = htmlElement.value;
      }
    }

    const grantedPermission = await browser.permissions.request({
      origins: [userOptions.url]
    });

    if (!grantedPermission) {
      setMessage('failure', i18n.permissionNotGranted);
      return;
    }

    userOptions.api_key = SparkMD5.hash(userOptions.username + ':' + userOptions.password);

    browser.storage.local.set(userOptions)
      .then(() => {
        setMessage('success', i18n.saveSuccess);
        reloadHostsTextField();
        browser.runtime.sendMessage('init');
      })
      .catch(() => setMessage('failure', i18n.saveFail));
  };

  return ({
    init: async () => {
      localize();
      restoreOptions();
      await reloadHostsTextField();
      document.addEventListener('submit', saveOptions);
      HTML.removePermissionsBtn.addEventListener('click', removeHostPermissions);
    },
  });
};

document.addEventListener('DOMContentLoaded', () => freshRssCheckerOptions().init());
