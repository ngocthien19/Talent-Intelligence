import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { env } from '~/config/environment'
import multer from 'multer'

// Cấu hình kết nối tài khoản Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

// 1. CV: dùng memoryStorage vì mình cần buffer để vừa parse nội dung
const cvMemoryStorage = multer.memoryStorage()
const uploadCV = multer({
  storage: cvMemoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt']
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase()
    if (!allowed.includes(ext)) {
      return cb(new Error('Định dạng CV không hợp lệ (chỉ chấp nhận pdf, doc, docx, txt)'))
    }
    cb(null, true)
  }
})

// 2. Avatar Storage (giữ nguyên - không cần buffer, chỉ cần URL kết quả)
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
})
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
})

// 3. Logo Storage (giữ nguyên)
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'company_logos',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }]
  }
})
const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
})

// Upload 1 buffer lên Cloudinary (dùng cho CV, vì multer chỉ giữ buffer trong RAM)
const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resource_type || 'raw',
        folder: options.folder,
        public_id: options.public_id
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    uploadStream.end(buffer)
  })
}

export const CloudinaryProvider = {
  cloudinary,

  // Upload buffer thủ công (CV)
  uploadBuffer,

  // Middleware multer
  uploadCV: uploadCV.single('cv'),
  uploadAvatar: uploadAvatar.single('avatar'),
  uploadLogo: uploadLogo.single('logo'),
  uploadMultipleCV: uploadCV.array('cvs', 5),
  uploadCompanyFiles: uploadLogo.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
  ])
}