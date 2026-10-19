/**
 * Uploaded images (avatars, book covers) live in MongoDB GridFS (bucket "uploads"), so they survive
 * redeploys on hosts with a temporary disk (Render) and move with the database.
 *
 * Documents store a host-independent path, FILE_PREFIX + id ("/api/files/<id>"); the frontend
 * puts the API origin in front. A file never changes once written (a new upload is a new id), so
 * it is served with a one-year immutable cache.
 */
const mongoose = require('mongoose');

const BUCKET = 'uploads';
const FILE_PREFIX = '/api/files/';

const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKET });

/**
 * Store a buffer. Resolves to the new file's id.
 * @param {Buffer} buffer
 * @param {{ filename: string, contentType: string, metadata?: object }} info
 */
const saveFile = (buffer, { filename, contentType, metadata = {} }) => new Promise((resolve, reject) => {
  const upload = bucket().openUploadStream(filename, { metadata: { ...metadata, contentType } });
  upload.once('error', reject);
  upload.once('finish', () => resolve(upload.id));
  upload.end(buffer);
});

/** The stored path for a file id: "/api/files/<id>" */
const fileUrl = (id) => `${FILE_PREFIX}${id}`;

/** The GridFS id in a stored path, or null when the path is not one of ours */
const idFromUrl = (url) => {
  const m = typeof url === 'string' ? url.match(/\/api\/files\/([a-f0-9]{24})$/i) : null;
  return m ? new mongoose.Types.ObjectId(m[1]) : null;
};

/** Delete a stored file by its path; ignores paths that are not GridFS files or are already gone */
const deleteByUrl = async (url) => {
  const id = idFromUrl(url);
  if (!id) return false;
  try {
    await bucket().delete(id);
    return true;
  } catch {
    return false;
  }
};

const findFile = async (id) => (await bucket().find({ _id: id }).limit(1).toArray())[0] || null;

/**
 * GET /api/files/:id - stream a stored image with long-lived caching (ETag/304 supported)
 */
const serveFile = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'File not found' });
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const file = await findFile(id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    const etag = `"${file._id}"`;
    res.set({
      'Content-Type': file.metadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: etag,
      'Last-Modified': file.uploadDate.toUTCString(),
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.headers['if-none-match'] === etag) return res.status(304).end();
    res.set('Content-Length', String(file.length));

    bucket().openDownloadStream(id)
      .once('error', () => { if (!res.headersSent) res.status(404).end(); else res.destroy(); })
      .pipe(res);
  } catch (error) {
    console.error('File read failed:', error.message);
    if (!res.headersSent) res.status(500).json({ success: false, message: 'File could not be read' });
  }
};

module.exports = { saveFile, fileUrl, idFromUrl, deleteByUrl, findFile, serveFile, BUCKET, FILE_PREFIX };
