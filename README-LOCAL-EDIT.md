# BULLSHIT PROJECT — No database / Local Edit Mode

This version does NOT connect to Supabase or any external database.

## How to use
1. Open `local-edit-config.js`.
2. Change `change-this-passcode` to your own passcode.
3. Upload the complete folder to GitHub Pages (or open it on your computer).
4. Open the website and choose UNLOCK EDIT MODE.
5. Enter your passcode.
6. Hold a character card on mobile, or right-click on desktop, to edit its profile, change its portrait URL, or remove it.

## Important limitation
Edits are saved in the browser's localStorage. They appear only in that browser on that device. They do NOT automatically update the website for other visitors, other devices, or the GitHub repository. Clearing browser site data may erase the edits. The original `characters.js` remains unchanged as a baseline backup.

The passcode is only a convenience lock. Because this is a static website, a passcode stored in a public JavaScript file is not secure against someone who inspects the website files. Do not use it for sensitive content or real access control.
