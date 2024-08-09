import { defaults, getOptions } from './storage.js';
import md5 from 'md5';
import { LocalStorageKey, MessageVariant, Options, supportsSidebar } from './constants';

const i18n = {
  title: chrome.i18n.getMessage('options_title'),
  extensionName: chrome.i18n.getMessage('extensionName'),
  urlLabel: chrome.i18n.getMessage('options_freshRssUrlLabel'),
  urlPlaceholder: chrome.i18n.getMessage('options_freshRssUrlPlaceholder'),
  urlHelp: chrome.i18n.getMessage('options_freshRssUrlHelp'),
  usernameLabel: chrome.i18n.getMessage('options_freshRssUsernameLabel'),
  usernamePlaceholder: chrome.i18n.getMessage('options_freshRssUsernamePlaceholder'),
  passwordLabel: chrome.i18n.getMessage('options_freshRssPasswordLabel'),
  passwordPlaceholder: chrome.i18n.getMessage('options_freshRssPasswordPlaceholder'),
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
  title: document.querySelector('#title') as HTMLHeadingElement,
  urlLabel: document.querySelector('label[for="url"]') as HTMLLabelElement,
  url: document.querySelector('#url') as HTMLInputElement,
  urlHelp: document.querySelector('#url-help') as HTMLParagraphElement,
  usernameLabel: document.querySelector('label[for="username"]') as HTMLLabelElement,
  username: document.querySelector('#username') as HTMLInputElement,
  passwordLabel: document.querySelector('label[for="password"]') as HTMLLabelElement,
  password: document.querySelector('#password') as HTMLInputElement,
  intervalLabel: document.querySelector('label[for="interval"]') as HTMLLabelElement,
  interval: document.querySelector('#interval') as HTMLInputElement,
  sidebar: document.querySelector('#sidebar') as HTMLInputElement,
  sidebarOption: document.querySelector('#sidebar-option') as HTMLLabelElement,
  save: document.querySelector('#save') as HTMLButtonElement,
  message: document.querySelector('#message') as HTMLSpanElement,
  hostResetMessage: document.querySelector('#host-reset-message') as HTMLSpanElement,
  removePermissionsBtn: document.querySelector('#remove-permissions') as HTMLButtonElement,
  hostsLabel: document.querySelector('#hosts-label') as HTMLLabelElement,
  hosts: document.querySelector('#hosts') as HTMLTextAreaElement,
};

const clearMessage = () => {
  HTML.message.style.display = 'none';
  HTML.message.className = '';
};

const setMessage = (variant: MessageVariant, text: string) => {
  HTML.message.textContent = text;
  HTML.message.className = variant;
  HTML.message.style.display = 'block';
  setTimeout(clearMessage, 2500);
};

const clearHostResetMessage = () => {
  HTML.hostResetMessage.style.display = 'none';
  HTML.hostResetMessage.className = '';
};

const setHostResetMessage = (variant: MessageVariant, text: string) => {
  HTML.hostResetMessage.textContent = text;
  HTML.hostResetMessage.className = variant;
  HTML.hostResetMessage.style.display = 'block';
  setTimeout(clearHostResetMessage, 2500);
};

const restoreOptions = async () => {
  const userOptions = await getOptions();
  for (const key in userOptions) {
    const htmlElement = document.getElementsByName(key)[0] as HTMLInputElement | undefined;
    if (htmlElement !== undefined) {
      if (htmlElement.type === 'checkbox') {
        htmlElement.checked = userOptions[key as keyof Options] === 'true';
      } else {
        htmlElement.value = <string>userOptions[key as keyof Options];
      }
    }
  }
};

const removeHostPermissions = async () => {
  const all_permissions = await chrome.permissions.getAll();
  if (all_permissions.origins && all_permissions.origins.length > 0) {
    await chrome.permissions.remove({ origins: [...all_permissions.origins] });
  }
  await reloadHostsTextField();
  setHostResetMessage(MessageVariant.Success, i18n.permissionsCleared);
};

const reloadHostsTextField = async () => {
  const all_permissions = await chrome.permissions.getAll();
  if (all_permissions.origins && all_permissions.origins.length > 0) {
    HTML.hosts.value = all_permissions.origins.join('\n');
  }
};

const saveOptions = async (event: SubmitEvent) => {
  event.preventDefault();
  const userOptions: Options = { ...defaults };

  for (const key in userOptions) {
    const htmlElement = document.getElementsByName(key)[0] as HTMLInputElement | undefined;

    if (htmlElement !== undefined) {
      switch (htmlElement.type) {
        case 'checkbox': {
          // @ts-expect-error don't bother
          userOptions[key as keyof Options] = htmlElement.checked;
          break;
        }
        case 'number': {
          // @ts-expect-error don't bother
          userOptions[key as keyof Options] = Number.parseInt(htmlElement.value);
          break;
        }
        case 'url': {
          // @ts-expect-error don't bother
          userOptions[key as keyof Options] = htmlElement.value.replace(/\/?$/, '/');
          break;
        }
        default: {
          // @ts-expect-error don't bother
          userOptions[key as keyof Options] = htmlElement.value;
        }
      }
    }
  }

  const grantedPermission = await chrome.permissions.request({
    origins: [userOptions.url],
  });

  if (!grantedPermission) {
    setMessage(MessageVariant.Error, i18n.permissionNotGranted);
    return;
  }

  userOptions.apiKey = md5(`${userOptions.username}:${userOptions.password}`);

  try {
    await chrome.storage.sync.set(userOptions);

    // Firefox
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(LocalStorageKey.Url, userOptions.url);
      localStorage.setItem(LocalStorageKey.Sidebar, String(userOptions.sidebar));
    }

    await reloadHostsTextField();

    setMessage(MessageVariant.Success, i18n.saveSuccess);
  } catch (error) {
    console.error(error);
    setMessage(MessageVariant.Error, i18n.saveFail);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  // Localize
  document.title = i18n.title;
  HTML.title.textContent = i18n.extensionName;

  HTML.urlLabel.textContent = i18n.urlLabel;
  HTML.url.placeholder = i18n.urlPlaceholder;
  HTML.urlHelp.textContent = i18n.urlHelp;
  HTML.usernameLabel.textContent = i18n.usernameLabel;
  HTML.username.placeholder = i18n.usernamePlaceholder;
  HTML.passwordLabel.textContent = i18n.passwordLabel;
  HTML.password.placeholder = i18n.passwordPlaceholder;
  HTML.intervalLabel.textContent = i18n.intervalLabel;
  HTML.interval.placeholder = i18n.intervalPlaceholder;
  (HTML.sidebar.nextSibling as HTMLElement).textContent = ` ${i18n.sidebarLabel}`;

  HTML.save.textContent = i18n.save;

  HTML.removePermissionsBtn.textContent = i18n.removePermissions;
  HTML.hostsLabel.textContent = i18n.hostsLabel;
  HTML.hosts.placeholder = i18n.hostsPlaceholder;

  if (!supportsSidebar) {
    HTML.sidebarOption.style.display = 'none';
  }

  await restoreOptions();
  await reloadHostsTextField();
  document.addEventListener('submit', saveOptions);
  HTML.removePermissionsBtn.addEventListener('click', removeHostPermissions);
});
