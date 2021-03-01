FreshRSS Checker
=============
FreshRSS Checker is a WebExtension that tracks unread items in a [FreshRSS](https://freshrss.org) instance and shows a badge with the number of unread articles.

## Setup
1. Install the extension: [Firefox Add-Ons](https://addons.mozilla.org/addon/freshrss-checker/) - [Chrome Web Store](https://chrome.google.com/webstore/detail/freshrss-checker/fkckemcdpfnblnkndachclpjfmlhofeg)
2. Open the extension's preferences page from add-ons manager and set the FreshRSS base URL, username, and API password (not your regular password, remember to enable mobile API access).
3. Place the toolbar icon in a visible location if you want to see the number of unread items.

## Build

1. Clone
2. Install dependencies with `npm install`
3. Run `npm run start:firefox`
4. Build with `npm run build`

Primary development target is Firefox, Chromium-based browsers are polyfilled.

## Usage notes
* Clicking the toolbar icon opens your FreshRSS instance
* Right-clicking it and choosing "Check now" forces the badge to update
* The time between checks can be set in the preferences.
* The password is stored in the extension's local storage, effectively in clear text on the file system. It's not transmitted over the network, only an MD5 hash of your username plus password is!
