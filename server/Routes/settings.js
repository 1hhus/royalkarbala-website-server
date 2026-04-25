const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const { db } = require('../app')
const checkAuthentication = require('../middlewares/auth')

const Router = express.Router()

const settingsCollection = db.collection('Settings')

const imgDir = path.join(__dirname, '..', 'public', 'imgs')

if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true })
}

const DEFAULT_SETTINGS_KEY = 'main'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MIN_WEBP_QUALITY = 75
const INITIAL_WEBP_QUALITY = 100

const upload = multer({
  storage: multer.memoryStorage()
})

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: 'حدث خطأ أثناء تحميل الملف',
      error: err.message
    })
  }

  if (err) {
    return res.status(400).json({
      message: err.message
    })
  }

  next()
}

function getImagePath(filename) {
  return path.join(imgDir, path.basename(filename))
}

async function deleteImageFile(filename) {
  try {
    if (!filename) return

    const filePath = getImagePath(filename)

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath)
    }
  } catch (err) {
    console.log('Error deleting image:', err.message)
  }
}

async function validateImage(buffer) {
  try {
    const metadata = await sharp(buffer).metadata()

    if (!metadata || !metadata.format) {
      throw new Error('Invalid image')
    }

    return metadata
  } catch (err) {
    throw new Error('الملف المرفوع ليس صورة صحيحة')
  }
}

async function convertImageToWebp(buffer) {
  const metadata = await validateImage(buffer)

  let outputBuffer = await sharp(buffer)
    .rotate()
    .webp({
      quality: INITIAL_WEBP_QUALITY,
      effort: 6
    })
    .toBuffer()

  if (outputBuffer.length <= MAX_IMAGE_SIZE) {
    return outputBuffer
  }

  let quality = INITIAL_WEBP_QUALITY

  while (outputBuffer.length > MAX_IMAGE_SIZE && quality > MIN_WEBP_QUALITY) {
    quality -= 5

    outputBuffer = await sharp(buffer)
      .rotate()
      .webp({
        quality,
        effort: 6
      })
      .toBuffer()
  }

  if (outputBuffer.length <= MAX_IMAGE_SIZE) {
    return outputBuffer
  }

  let width = metadata.width || null

  while (outputBuffer.length > MAX_IMAGE_SIZE && width && width > 1200) {
    width = Math.floor(width * 0.9)

    outputBuffer = await sharp(buffer)
      .rotate()
      .resize({
        width,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality,
        effort: 6
      })
      .toBuffer()
  }

  return outputBuffer
}

async function saveImageAsWebp(fileBuffer) {
  const processedImage = await convertImageToWebp(fileBuffer)

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
  const webpFilename = `default-${uniqueSuffix}.webp`
  const webpPath = path.join(imgDir, webpFilename)

  await fs.promises.writeFile(webpPath, processedImage)

  return webpFilename
}

async function getSettings() {
  try {
    return await settingsCollection.document(DEFAULT_SETTINGS_KEY)
  } catch (err) {
    if (err.code === 404) {
      const result = await settingsCollection.save(
        {
          _key: DEFAULT_SETTINGS_KEY,
          defaultDishImage: ''
        },
        {
          returnNew: true
        }
      )

      return result.new
    }

    throw err
  }
}

Router.route('/default-dish-image').get(checkAuthentication('MENU'), async (req, res) => {
  try {
    const settings = await getSettings()

    res.status(200).json({
      message: 'success',
      data: {
        defaultDishImage: settings.defaultDishImage || ''
      }
    })
  } catch (err) {
    res.status(500).json({
      message: 'خطأ في جلب الصورة التلقائية',
      error: err.message
    })
  }
})

Router.route('/default-dish-image').put(
  checkAuthentication('MENU'),
  upload.single('image'),
  handleMulterError,
  async (req, res) => {
    let newImage = null

    try {
      const file = req.file

      if (!file) {
        return res.status(400).json({
          message: 'يرجى ارفاق صورة'
        })
      }

      const settings = await getSettings()
      const oldImage = settings.defaultDishImage

      newImage = await saveImageAsWebp(file.buffer)

      const updated = await settingsCollection.update(
        DEFAULT_SETTINGS_KEY,
        {
          defaultDishImage: newImage
        },
        {
          returnNew: true
        }
      )

      if (oldImage && oldImage !== newImage) {
        await deleteImageFile(oldImage)
      }

      res.status(200).json({
        message: 'تم تحديث الصورة التلقائية بنجاح',
        data: {
          defaultDishImage: updated.new.defaultDishImage
        }
      })
    } catch (err) {
      if (newImage) {
        await deleteImageFile(newImage)
      }

      res.status(500).json({
        message: err.message || 'خطأ في تحديث الصورة التلقائية',
        error: err.message
      })
    }
  }
)

module.exports = Router
