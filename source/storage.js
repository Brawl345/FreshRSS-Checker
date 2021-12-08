export const defaults = Object.freeze({
  url: '',
  apiKey: '',
  username: '',
  password: '',
  interval: 5.0,
  // sidebar: false,
});

export const getOptions = async () => {
  return chrome.storage.sync.get(defaults);
};
