# prettybusysolutions-eng.github.io

Public GreenOps beta site for Pretty Busy Solutions.

Live surface: https://prettybusysolutions-eng.github.io/

## Status

This repository is maintained by Pretty Busy Solutions. Operational changes should preserve evidence-bound review, clear commit history, and approval-gated mutation for sensitive workflows.

This is a static deployment surface, not an installable package. Deploy history
is the version record; GitHub package releases are intentionally not created for
routine site edits.

## Local preview

```bash
python3 -m http.server 8080
```

Then open `http://127.0.0.1:8080/`. The site code is MIT licensed; brand names
and logos are not granted as trademarks by the software license.

## Static asset verification

Run `python3 scripts/check_static_assets.py` before deployment. CI checks local
script, image, stylesheet, icon, and manifest file references in the HTML pages.
This does not execute browser JavaScript or validate backend connectivity,
offline behavior, accessibility, or external links.

## Browser and cache verification

The browser workflow loads the actual shipped application at desktop and mobile
sizes, checks uncaught JavaScript errors, registers the service worker, and reloads
the cached shell offline. It checks preservation of unrelated origin caches.
Service-worker tests also assert that third-party requests, API requests and
writes bypass the public shell cache. The worker clears only its own versioned caches.

These checks do not establish backend availability, authenticated job mutation,
payment fulfillment, conversion effectiveness or accessibility conformance.
Local browser execution was unavailable during reconciliation because Chromium
could not be downloaded; GitHub browser results must be checked on the exact head.
