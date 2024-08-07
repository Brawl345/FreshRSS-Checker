import { getOptions } from './storage.js';

getOptions().then(({ url }) => {
  if (url !== '') {
    chrome.sidebarAction.setPanel({
      panel: url,
    });
  }
});
