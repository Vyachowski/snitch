# Site Uptime Monitor (Snitch)

## 1. What is it and what problem does it solve?
**Site Uptime Monitor** is a browser extension that helps you track websites availability. You add websites, and the extension automatically checks them at set intervals, stores the statistics locally in your browser, and shows uptime and last checks in a convenient interface. **Problem:** You don’t need to manually check if a website is working — the extension does it for you and presents clear statistics.

## 2. How does it work?
1. **Data storage** — Dexie (IndexedDB) saves websites and daily statistics.  
2. **Website checks** — `fetch` with a timeout verifies if the site is accessible.  
3. **Automation** — chrome.alarms triggers checks every `intervalMinutes`.  
4. **UI** — The React app lets you add/remove sites, see status (green/red), yearly uptime, and the last check time.

## 3. What does it look like?
### UI
- List of websites: status dot (green/red), URL, uptime, last check.  
- Adding a website: name + URL + check interval.  
- Deleting a website: trash icon.

## 4. How to use in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `dist` folder after building (`npm run build`)
4. The extension will appear in Chrome; you can add sites and monitor uptime.

Or simply install the extension from the Chrome Web Store.
