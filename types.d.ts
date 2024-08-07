declare namespace chrome {
  interface SetPanelDetails {
    panel: string | null;
    tabId?: number;
    windowId?: number;
  }

  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/sidebarAction
  export const sidebarAction: {
    open: () => void;
    close: () => void;
    setPanel(details: SetPanelDetails): void;
  };
}

declare module 'md5' {
  function md5(input: string): string;
  export default md5;
}
