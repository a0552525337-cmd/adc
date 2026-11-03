# ALMOGHANI LIVE — Private hosting

Deploy as a **Node.js web service**, not GitHub Pages (which cannot securely enforce passwords).

Set environment variables:
- `SITE_PASSWORD` — temporary initial password (100100), change it after first login.
- `SESSION_SECRET` — long random secret, at least 32 bytes.
- `DATA_DIR` — persistent volume path for password changes.

Start: `npm start`

This package protects the HTML behind a server-side login. Channel management currently uses browser localStorage, so channels are **not synchronized across devices**. IPTV subscription credentials are **not embedded**. Connect a licensed IPTV provider through a separate secure server integration; never publish credentials in HTML or playlists.

**Security:** Use HTTPS. Changing the password writes a file in DATA_DIR; without persistent storage, the change may be lost on redeploy. For production use, set SITE_PASSWORD to a strong value and mount persistent storage.
