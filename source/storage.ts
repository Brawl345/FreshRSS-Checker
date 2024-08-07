import { Options } from './constants';

export const defaults: Options = Object.freeze({
  url: '',
  apiKey: '',
  username: '',
  password: '',
  interval: 5,
  sidebar: false,
});

export const getOptions: () => Promise<Options> = async () => chrome.storage.sync.get(defaults) as Promise<Options>;
