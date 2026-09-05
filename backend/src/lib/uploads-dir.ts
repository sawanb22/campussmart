import path from 'path';

// Single source of truth for where uploaded files live on disk, used by both
// the multer storage destinations (upload.middleware.ts) and the static file
// server (index.ts). Previously each computed this independently via `../..`
// traversal from its own compiled file location — correct in theory, but a
// partial/stale deploy (only some dist files replaced) could let the two
// counts drift apart, so uploads would save successfully but 404 when served.
//
// Override with UPLOADS_DIR in the environment to pin an absolute path (e.g.
// a dedicated persistent disk/mount on the host). Defaults to an `uploads`
// folder next to wherever the process was started from, which on a normal
// `node dist/index.js` run is the app's own root — printed at startup so it
// can be checked against the hosting panel's file manager.
export const UPLOADS_DIR = process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.resolve(process.cwd(), 'uploads');
