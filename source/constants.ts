export const supportsSidebar = 'sidebarAction' in chrome;

export const ALARM_ID = 'freshrss-checker@brawl345.github.com__alarm';

export enum MenuItem {
  CheckNow = 'freshrss-checker@brawl345.github.com__browserAction_contextMenu_checkNow',
  OpenPage = 'freshrss-checker@brawl345.github.com__browserAction_contextMenu_openPage',
  OpenSidebar = 'freshrss-checker@brawl345.github.com__browserAction_contextMenu_openSidebar',
}

export interface Options {
  url: string;
  apiKey: string;
  username: string;
  password: string;
  interval: number;
  sidebar: boolean;
}

export enum BadgeColor {
  Normal = 'blue',
  Warning = 'yellow',
  Failure = 'red',
}

export enum LocalStorageKey {
  Sidebar = 'sidebar',
  Url = 'url',
}

export enum MessageVariant {
  Success = 'success',
  Error = 'error',
}

export interface FreshRSSApiResponse {
  api_version: number;
  auth: number;
  last_refreshed_on_time: number;
  unread_item_ids: string;
}
