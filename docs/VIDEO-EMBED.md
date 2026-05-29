# Demo video embed

## What ships autonomously

The canonical demo asset for recap-studio is the silent GIF at
`.github/assets/demo.gif`. It is committed to the repo and embedded at the top
of `README.md` via standard Markdown:

```markdown
![recap-studio demo](.github/assets/demo.gif)
```

A GIF is the only fully-autonomous README embed: it renders inline on GitHub
with no extra steps, no upload, and no manual action. This is the default and it
is already in place.

## Optional: add a native HTML5 player (manual)

GitHub renders an actual `<video>` player only for files it hosts on its own
`user-attachments` CDN. It will **not** play a `<video>` tag that points at a
file committed in the repo (e.g. `demo-output/output.mp4`) — that path is not a
playable video source on github.com. To get the native player you must upload
the mp4 to GitHub once and use the URL it returns.

Steps:

1. Open any GitHub comment box on this repo: a new **issue**, a **pull request**
   description/comment, or a **release** description.
2. Drag `demo-output/output.mp4` into the comment box (or click the attach bar
   and select it). Wait for the upload to finish.
3. GitHub replaces it with a URL of the form
   `https://github.com/user-attachments/assets/…`. Copy that URL.
4. Paste the URL on its own line at the **top of `README.md`, above the GIF**.
   GitHub auto-detects the attachment URL and renders an inline HTML5 player.
   You can discard the issue/PR/release you used to upload — the URL keeps
   working.

Example placement at the top of the README:

```markdown
https://github.com/user-attachments/assets/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

![recap-studio demo](.github/assets/demo.gif)
```

## Limits and format notes

- **Hosting is manual only.** The `user-attachments` URL is produced by the
  upload UI; it cannot be generated from a repo path.
- **Size:** 10 MB per video on free accounts, 100 MB on paid (Pro / Team /
  Enterprise) accounts.
- **Formats:** `.mp4`, `.mov`, `.webm`. Use **H.264** video for broad
  compatibility (the committed `demo-output/output.mp4` is H.264, yuv420p,
  `+faststart`, generated from `.github/assets/demo.gif`).
- **`demo-output/` is gitignored.** The mp4 is a local render scratch and is not
  committed; only the GIF is tracked.
