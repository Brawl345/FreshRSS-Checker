import { defaults, getOptions } from './storage.js';
import md5 from 'md5';

const sidebarSupported = 'sidebarAction' in chrome;

const i18n = {
  title: chrome.i18n.getMessage('options_title'),
  extensionName: chrome.i18n.getMessage('extensionName'),
  urlLabel: chrome.i18n.getMessage('options_freshRssUrlLabel'),
  urlPlaceholder: chrome.i18n.getMessage('options_freshRssUrlPlaceholder'),
  usernameLabel: chrome.i18n.getMessage('options_freshRssUsernameLabel'),
  usernamePlaceholder: chrome.i18n.getMessage(
    'options_freshRssUsernamePlaceholder'
  ),
  passwordLabel: chrome.i18n.getMessage('options_freshRssPasswordLabel'),
  passwordPlaceholder: chrome.i18n.getMessage(
    'options_freshRssPasswordPlaceholder'
  ),
  intervalLabel: chrome.i18n.getMessage('options_intervalLabel'),
  intervalPlaceholder: chrome.i18n.getMessage('options_intervalPlaceholder'),
  sidebarLabel: chrome.i18n.getMessage('options_sidebarLabel'),
  save: chrome.i18n.getMessage('options_save'),
  removePermissions: chrome.i18n.getMessage('options_removePermissions'),
  hostsLabel: chrome.i18n.getMessage('options_hostsLabel'),
  hostsPlaceholder: chrome.i18n.getMessage('options_hostsPlaceholder'),
  permissionsCleared: chrome.i18n.getMessage('options_permissionsCleared'),
  permissionNotGranted: chrome.i18n.getMessage('options_permissionNotGranted'),
  saveSuccess: chrome.i18n.getMessage('options_saveSuccess'),
  saveFail: chrome.i18n.getMessage('options_saveFail'),
};

const HTML = {
  title: document.querySelector('#title'),
  url: document.querySelector('#url'),
  username: document.querySelector('#username'),
  password: document.querySelector('#password'),
  interval: document.querySelector('#interval'),
  sidebar: document.querySelector('#sidebar'),
  sidebarOption: document.querySelector('#sidebar-option'),
  save: document.querySelector('#save'),
  message: document.querySelector('#message'),
  removePermissionsBtn: document.querySelector('#remove-permissions'),
  hostsLabel: document.querySelector('#hosts-label'),
  hosts: document.querySelector('#hosts'),
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
  const userOptions = await getOptions();
  for (const key in userOptions) {
    const htmlElement = document.getElementsByName(key)[0];
    if (htmlElement !== undefined) {
      if (htmlElement.type === 'checkbox') {
        htmlElement.checked = userOptions[key];
      } else {
        htmlElement.value = userOptions[key];
      }
    }
  }
};

const removeHostPermissions = async () => {
  const all_permissions = await chrome.permissions.getAll();
  if (all_permissions.origins.length > 0) {
    await chrome.permissions.remove({ origins: [...all_permissions.origins] });
  }
  await reloadHostsTextField();
  setMessage('success', i18n.permissionsCleared);
};

const reloadHostsTextField = async () => {
  const all_permissions = await chrome.permissions.getAll();
  HTML.hosts.value = all_permissions.origins.join('\n');
};

const saveOptions = async (event) => {
  event.preventDefault();
  const userOptions = {};
  Object.assign(userOptions, defaults);

  for (const key in userOptions) {
    const htmlElement = document.getElementsByName(key)[0];

    if (htmlElement !== undefined) {
      switch (htmlElement.type) {
        case 'checkbox':
          userOptions[key] = htmlElement.checked;
          break;
        case 'number':
          userOptions[key] = Number.parseInt(htmlElement.value);
          break;
        case 'url':
          userOptions[key] = htmlElement.value.replace(/\/?$/, '/');
          break;
        default:
          userOptions[key] = htmlElement.value;
      }
    }
  }

  const grantedPermission = await chrome.permissions.request({
    origins: [userOptions.url],
  });

  if (!grantedPermission) {
    setMessage('failure', i18n.permissionNotGranted);
    return;
  }

  userOptions.apiKey = md5(`${userOptions.username}:${userOptions.password}`);

  try {
    await chrome.storage.sync.set(userOptions);

    // Firefox
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('url', userOptions.url);
      localStorage.setItem('sidebar', userOptions.sidebar);
    }

    await reloadHostsTextField();

    setMessage('success', i18n.saveSuccess);
  } catch (error) {
    console.error(error);
    setMessage('failure', i18n.saveFail);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Localize
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
  HTML.sidebar.previousSibling.textContent = i18n.sidebarLabel;

  HTML.save.textContent = i18n.save;

  HTML.removePermissionsBtn.textContent = i18n.removePermissions;
  HTML.hostsLabel.textContent = i18n.hostsLabel;
  HTML.hosts.placeholder = i18n.hostsPlaceholder;

  if (sidebarSupported === false) {
    HTML.sidebarOption.style.display = 'none';
  }

  restoreOptions();
  reloadHostsTextField();
  document.addEventListener('submit', saveOptions);
  HTML.removePermissionsBtn.addEventListener('click', removeHostPermissions);
});
