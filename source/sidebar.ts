import { getOptions } from './storage';

const { url } = await getOptions();
if (url !== '') {
  chrome.sidebarAction.setPanel({
    panel: url,
  });
}
