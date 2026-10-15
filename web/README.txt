PURRMINDERS - your cat office reminders app

Try it on a computer
  Double-clicking index.html works for a quick look, but Kathleen's voice won't play that way
  (browsers block voice files on pages opened from your files). For Kathleen, use the
  Netlify link below on your computer or phone.
  Before uploading: unzip all 4 Purrminders zips into the same place, so this folder has a
  "voice" folder inside it.

Install it on your phone (recommended)
  1. Go to https://app.netlify.com/drop on a computer.
  2. Drag this whole "purrminders" folder onto the page. Netlify gives you a link.
  3. Open that link on your phone in Chrome (Android) or Safari (iPhone).
  4. Android: menu > "Add to Home screen" / "Install app". iPhone: Share > "Add to Home Screen".
  It then opens full-screen like an app and works offline.

Android app
  There's also a real Android app (APK) with alarms that ring even when the app is closed:
  github.com/oo12341man-ux/purrminders-android > Releases. Install it over the old one to update.

Your data
  Everything is saved on the device you use. Use the menu (three lines) > "Back up"
  now and then.

Phone alerts, emails and sync between devices
  Optional, free, runs in your own Google account. Follow google-script/SETUP-GOOGLE.txt
  (about 15 minutes, once). Code.gs is the script you paste into Google.

Gemini smart mode (optional, free)
  Gemini reads what you type or say, answers questions (end them with ?), and polishes
  Sesame's morning briefing. Without internet, or when the free limit is used up, the cats
  use their own reading, so the app always works.
  1. Go to aistudio.google.com, sign in, and tap "Get API key" > Create API key. Copy it.
  2. In the app: Menu > Gemini smart mode > paste the key > Connect Gemini.
  3. Do this on each device you use. The key stays on that device only.
  Privacy: on the free tier Google may use what you send to improve its products, and people
  may read it. Don't type card numbers or passwords. You can switch each use off in the menu.

Make another copy (outlet, partner)
  Duplicate this folder, edit config.js (officeName and a different copyId),
  and drop the new folder onto Netlify Drop for its own link.

Voice, photos and sharing
  Mic button: tap and speak; you always confirm before it's saved (needs internet, works in Chrome / Safari).
  Camera button: attach a photo to a new item; or open an item and tap "Add photo".
  Photos stay on the device they were taken on and are not included in backups.
  Android, once installed: share text, links or photos from other apps to "Purrminders".

Sesame's voice (Kathleen)
  The "voice" folder holds Kathleen, Sesame's natural voice (about 65 MB, free CC0 voice).
  The first time she speaks, your phone also fetches a small speech engine from the internet
  and saves everything, so after that she works offline. Keep the "voice" folder when you
  upload to Netlify. If she can't load, the app falls back to your phone's own voice.
  Menu > Sesame's voice lets you switch, and "Test Sesame's voice" plays a short sample.
