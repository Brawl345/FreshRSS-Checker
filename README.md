# FreshRSS Checker

FreshRSS Checker is a WebExtension that tracks unread items in a [FreshRSS](https://freshrss.org) instance and shows a
badge with the number of unread articles.

## Setup

1. Install the extension from [Firefox Add-Ons](https://addons.mozilla.org/addon/freshrss-checker/) or
   the [Chrome Web Store](https://chrome.google.com/webstore/detail/freshrss-checker/fkckemcdpfnblnkndachclpjfmlhofeg)
2. Click the extension icon and set the FreshRSS base URL, username, and API
   password (**not your regular password**, remember to enable mobile API access).

## Build

1. Clone
2. Install dependencies with `npm ci`
3. Run `npm run dev` for bundling the JS
4. Run `npm run start:firefox` or `npm run start:chrome` for starting the browser with the extension pre-loaded and
   ready for debugging with
   hot-reloading
5. Build for production with `npm run web-ext:build`

## Usage notes

- Clicking the toolbar icon opens your FreshRSS instance
- Firefox users can open FreshRSS in the sidebar instead and default to it, which will also change the context menu on
  the icon accordingly
- Right-clicking it and choosing "Check now" forces the badge to update
- The time between checks can be set in the preferences.
- The password is stored in the extension's local storage, effectively in clear text on the file system. It's not
  transmitted over the network, only an MD5 hash of your username plus password is!
