FreshRSS Checker
================
FreshRSS Checker is a Firefox WebExtension that tracks unread items in a [FreshRSS](https://freshrss.org) instance. Specifically, it does the following:

* Provides a toolbar icon that indicates the number of unread feed items

## Setup
1. Install the extension from the [releases page](https://github.com/Brawl345/FreshRSS-Checker/releases).
2. Open the extension's preferences page from Addons manager and set the FeedRSS URL, username, and API password (not your regular password, remember to enable mobile API access). 
3. Place the toolbar icon in a visible location if you want to see the number of unread items.

## Usage notes
* Clicking the toolbar icon opens the rss page
* Right-clicking it and choosing "Check now" forces the badge to update
* The time between checks can be set in the preferences.
* The password is stored in the extension's local storage, effectively in clear text on the file system.

## Credits
* Based on [Miniflux checker](https://github.com/willsALMANJ/miniflux-checker)
* Uses [js-md5](https://github.com/emn178/js-md5)
