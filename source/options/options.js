'use strict';

/* global SparkMD5 */

const freshRssCheckerOptions = () => {

  const message = document.getElementById('message');
  const removePermissionsBtn = document.getElementById('remove-permissions');
  const hosts = document.getElementById('hosts');

  const OPTIONS = {
    url: '',
    username: '',
    password: '',
    interval: 5.0,
  };

  const clearMessage = () => {
    message.style.display = 'none';
    message.className = '';
  };

  const setMessage = (variant, text) => {
    message.textContent = text;
    message.className = variant;
    message.style.display = 'block';
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
    setMessage('success', ' Permissions cleared! Please remember to re-save your settings.');
  };

  const reloadHostsTextField = async () => {
    hosts.value = (await browser.permissions.getAll()).origins.join('\n');
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
      setMessage('failure', 'Saving failed because permission was not granted.');
      return;
    }

    userOptions.api_key = SparkMD5.hash(userOptions.username + ':' + userOptions.password);

    browser.storage.local.set(userOptions)
      .then(() => {
        setMessage('success', 'Settings saved!');
        reloadHostsTextField();
        browser.runtime.sendMessage('init');
      })
      .catch(() => setMessage('failure', 'Saving failed.'));
  };

  return ({
    init: async () => {
      restoreOptions();
      await reloadHostsTextField();
      document.addEventListener('submit', saveOptions);
      removePermissionsBtn.addEventListener('click', removeHostPermissions);
    },
  });
};

document.addEventListener('DOMContentLoaded', () => freshRssCheckerOptions().init());
