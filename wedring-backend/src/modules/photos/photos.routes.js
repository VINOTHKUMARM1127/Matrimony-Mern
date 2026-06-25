/**
 * Wedring Backend — Photos Routes
 */
import { Router } from 'express';
import multer from 'multer';
import auth from '../../middleware/auth.js';
import { uploadLimiter } from '../../middleware/rateLimit.js';
import * as photosController from './photos.controller.js';

const router = Router();

// Multer config: memory storage, 5MB limit, images only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

router.post('/upload', auth, uploadLimiter, upload.single('photo'), photosController.upload);
router.delete('/:photoId', auth, photosController.remove);
router.put('/:photoId/primary', auth, photosController.setPrimary);
router.get('/', auth, photosController.list);

export default router;
