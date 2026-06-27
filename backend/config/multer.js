const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, `../uploads/${folder}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    cb(null, `${folder}_${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const dangerousExtensions = ['.exe', '.sh', '.php', '.js', '.py', '.bat', '.cmd', '.asp', '.aspx', '.jsp', '.cgi', '.pl'];

const imageFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (dangerousExtensions.includes(ext)) {
    return cb(new Error('Executable or script files are strictly prohibited'), false);
  }
  if (/image\/(jpeg|jpg|png|webp|gif)/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only images allowed'), false);
};

const videoFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (dangerousExtensions.includes(ext)) {
    return cb(new Error('Executable or script files are strictly prohibited'), false);
  }
  if (/video\/(mp4|webm|ogg)/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only video files allowed'), false);
};

const uploadSlider = multer({ storage: createStorage('slider'), fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadPopup  = multer({ storage: createStorage('popup'),  fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadBanner = multer({ storage: createStorage('banner'), fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadVideo  = multer({ storage: createStorage('video'),  fileFilter: videoFilter,  limits: { fileSize: 100 * 1024 * 1024 } });

module.exports = { uploadSlider, uploadPopup, uploadBanner, uploadVideo };
