import { defaults, getOptions } from './storage.js';
import md5 from 'md5';

// TODO: Firefox does not yet support Manifest v3
// const sidebarSupported = 'sidebarAction' in chrome;

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
  permissionNotGranted: chrome.i18n.getMessage('options_permissionNotGranted'),
  saveSuccess: chrome.i18n.getMessage('options_saveSuccess'),
  saveFail: chrome.i18n.getMessage('options_saveFail'),
};

const HTML = {
  title: document.getElementById('title'),
  url: document.getElementById('url'),
  username: document.getElementById('username'),
  password: document.getElementById('password'),
  interval: document.getElementById('interval'),
  sidebar: document.getElementById('sidebar'),
  sidebarOption: document.getElementById('sidebar-option'),
  save: document.getElementById('save'),
  message: document.getElementById('message'),
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
          userOptions[key] = parseInt(htmlElement.value);
          break;
        case 'url':
          userOptions[key] = htmlElement.value.replace(/\/?$/, '/');
          break;
        default:
          userOptions[key] = htmlElement.value;
      }
    }
  }

  // Don't ask for host permission if "access to all websites" is checked
  if (
    !(await chrome.permissions.contains({
      origins: ['http://*/*', 'https://*/*'],
    }))
  ) {
    const grantedPermission = await chrome.permissions.request({
      origins: [userOptions.url],
    });

    if (!grantedPermission) {
      setMessage('failure', i18n.permissionNotGranted);
      return;
    }
  }

  userOptions.apiKey = md5(userOptions.username + ':' + userOptions.password);

  try {
    await chrome.storage.sync.set(userOptions);
    setMessage('success', i18n.saveSuccess);
  } catch (err) {
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

  // if (sidebarSupported === false) {
  HTML.sidebarOption.style.display = 'none';
  // }

  restoreOptions();
  document.addEventListener('submit', saveOptions);
});
