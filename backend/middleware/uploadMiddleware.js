const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (folder) => {
  const uploadPath = path.join(__dirname, '../uploads', folder);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      // Clean extension and randomize filename completely
      const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    }
  });
};

// Strict validation: Reject executable/script extensions regardless of mimetype spoofing
const dangerousExtensions = ['.exe', '.sh', '.php', '.js', '.py', '.bat', '.cmd', '.asp', '.aspx', '.jsp', '.cgi', '.pl'];

const fileFilter = (allowedTypes) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (dangerousExtensions.includes(ext)) {
    return cb(new Error('Executable or script files are strictly prohibited'), false);
  }

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`), false);
  }
};

const sliderUpload = multer({
  storage: createStorage('slider'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
});

const bannerUpload = multer({
  storage: createStorage('banner'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp'])
});

const popupUpload = multer({
  storage: createStorage('popup'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
});

const videoUpload = multer({
  storage: createStorage('video'),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: fileFilter(['video/mp4', 'video/webm', 'video/ogg'])
});

module.exports = { sliderUpload, bannerUpload, popupUpload, videoUpload };
