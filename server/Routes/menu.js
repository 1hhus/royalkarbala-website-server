const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const { db } = require('../app')
const checkAuthentication = require('../middlewares/auth')

const Router = express.Router()

const dishCollection = db.collection('Dish')
const settingsCollection = db.collection('Settings')

const imgDir = path.join(__dirname, '..', 'public', 'imgs')

if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true })
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MIN_WEBP_QUALITY = 75
const INITIAL_WEBP_QUALITY = 100
const DEFAULT_SETTINGS_KEY = 'main'
const DEFAULT_DISH_IMAGE_TOKEN = '__DEFAULT_DISH_IMAGE__'

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

function shouldDeleteImage(filename) {
  if (!filename) return false
  if (filename === DEFAULT_DISH_IMAGE_TOKEN) return false
  return true
}

async function deleteImageFile(filename) {
  try {
    if (!shouldDeleteImage(filename)) return

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
  const webpFilename = `${uniqueSuffix}.webp`
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

async function getDefaultDishImage() {
  const settings = await getSettings()
  return settings.defaultDishImage || ''
}

async function resolveDefaultDishImages(dishes) {
  const defaultDishImage = await getDefaultDishImage()

  return dishes.map(dish => ({
    ...dish,
    image:
      dish.image === DEFAULT_DISH_IMAGE_TOKEN
        ? defaultDishImage
        : dish.image,
    isDefaultImage:
      dish.image === DEFAULT_DISH_IMAGE_TOKEN
  }))
}

async function resolveDefaultDishImage(dish) {
  const defaultDishImage = await getDefaultDishImage()

  return {
    ...dish,
    image:
      dish.image === DEFAULT_DISH_IMAGE_TOKEN
        ? defaultDishImage
        : dish.image,
    isDefaultImage:
      dish.image === DEFAULT_DISH_IMAGE_TOKEN
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET / — public dishes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Router.route('/').get(async (req, res) => {
  try {
    const type = req.query.type

    let query
    let bindVars

    if (type && type !== 'null') {
      query = `
        FOR doc IN Dish
          FILTER doc.isHidden != true
          FILTER doc.category == @type OR doc.category == CONCAT("Category/", @type)
          RETURN doc
      `
      bindVars = { type }
    } else {
      query = `
        FOR doc IN Dish
          FILTER doc.isHidden != true
          RETURN doc
      `
      bindVars = {}
    }

    const cursor = await db.query(query, bindVars)
    const data = await cursor.all()
    const resolvedData = await resolveDefaultDishImages(data)

    res.status(200).json({
      message: 'success',
      data: resolvedData
    })
  } catch (err) {
    console.log('An error occurred while getting menu data:', err)

    res.status(500).json({
      message: 'خطأ داخلي في السيرفر',
      error: err.message
    })
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /all — all dishes admin
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Router.route('/all').get(checkAuthentication('MENU'), async (req, res) => {
  try {
    const type = req.query.type

    let query
    let bindVars

    if (type && type !== 'null') {
      query = `
        FOR doc IN Dish
          FILTER doc.category == @type OR doc.category == CONCAT("Category/", @type)
          RETURN doc
      `
      bindVars = { type }
    } else {
      query = `
        FOR doc IN Dish
          RETURN doc
      `
      bindVars = {}
    }

    const cursor = await db.query(query, bindVars)
    const data = await cursor.all()
    const resolvedData = await resolveDefaultDishImages(data)

    res.status(200).json({
      message: 'success',
      data: resolvedData
    })
  } catch (err) {
    res.status(500).json({
      message: 'خطأ داخلي في السيرفر',
      error: err.message
    })
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /update-order
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Router.route('/update-order').put(checkAuthentication('MENU'), async (req, res) => {
  const { reorderedItems } = req.body

  try {
    for (const item of reorderedItems) {
      await dishCollection.update(item._key, {
        order: item.order
      })
    }

    res.status(200).json({
      message: 'Order updated successfully!'
    })
  } catch (err) {
    console.error('Error updating order:', err)

    res.status(500).json({
      message: 'Error updating order!'
    })
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /add-item
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Router.route('/add-item').post(
  checkAuthentication('MENU'),
  upload.single('image'),
  handleMulterError,
  async (req, res) => {
    let savedImage = null

    try {
      const data = req.body
      const file = req.file

      const keys = Object.keys(data)
      const hasEmpty = keys.some(key => data[key] === '' || data[key] === 0)

      if (hasEmpty) {
        return res.status(400).json({
          message: 'يرجى ملء جميع الحقول'
        })
      }

      if (file) {
        savedImage = await saveImageAsWebp(file.buffer)
      } else {
        savedImage = DEFAULT_DISH_IMAGE_TOKEN
      }

      const cursor = await db.query(`
        FOR doc IN Dish
          SORT doc.order DESC
          LIMIT 1
          RETURN doc.order
      `)

      const orders = await cursor.all()
      const highestOrder = orders.length > 0 ? orders[0] : 0

      const newDish = {
        ...data,
        names: JSON.parse(data.names),
        description: JSON.parse(data.description),
        isHidden: false,
        image: savedImage,
        order: highestOrder + 1
      }

      const result = await dishCollection.save(newDish, {
        returnNew: true
      })

      const resolvedDish = await resolveDefaultDishImage(result.new)

      res.status(201).json({
        message: 'تم أضافة الطبق بنجاح',
        data: resolvedDish
      })
    } catch (err) {
      if (savedImage && savedImage !== DEFAULT_DISH_IMAGE_TOKEN) {
        await deleteImageFile(savedImage)
      }

      res.status(500).json({
        message: err.message || 'خطأ داخلي في السيرفر',
        error: err.message
      })
    }
  }
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /:id
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Router.route('/:id').get(async (req, res) => {
  try {
    const key = req.params.id
    const dishData = await dishCollection.document(key)
    const resolvedDish = await resolveDefaultDishImage(dishData)

    res.status(200).json({
      message: 'success',
      data: resolvedDish
    })
  } catch (err) {
    if (err.code === 404) {
      return res.status(404).json({
        message: 'الطبق غير موجود'
      })
    }

    res.status(500).json({
      message: 'حدث خطأ',
      error: err.message
    })
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELETE /:id/delete
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Router.route('/:id/delete').delete(checkAuthentication('MENU'), async (req, res) => {
  try {
    const key = req.params.id

    const dish = await dishCollection.document(key)
    const imageToDelete = dish.image

    await dishCollection.remove(key)

    if (imageToDelete) {
      await deleteImageFile(imageToDelete)
    }

    res.status(200).json({
      message: 'تم حذف الطبق والصورة بنجاح'
    })
  } catch (err) {
    if (err.code === 404) {
      return res.status(404).json({
        message: 'الطبق غير موجود'
      })
    }

    res.status(500).json({
      message: 'internal server error',
      error: err.message
    })
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /:id/toggle-hide
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Router.route('/:id/toggle-hide').put(checkAuthentication('MENU'), async (req, res) => {
  try {
    const key = req.params.id

    const dish = await dishCollection.document(key)

    const updated = await dishCollection.update(
      key,
      {
        isHidden: !dish.isHidden
      },
      {
        returnNew: true
      }
    )

    const resolvedDish = await resolveDefaultDishImage(updated.new)

    res.status(200).json({
      message: 'نجح',
      data: resolvedDish
    })
  } catch (err) {
    if (err.code === 404) {
      return res.status(404).json({
        message: 'الطبق غير موجود'
      })
    }

    res.status(500).json({
      message: 'حدث خطأ',
      error: err.message
    })
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /:id/edit
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Router.route('/:id/edit').put(checkAuthentication('MENU'), async (req, res) => {
  try {
    const key = req.params.id
    const { image, isDefaultImage, ...updateData } = req.body

    await dishCollection.update(key, updateData)

    res.status(200).json({
      message: 'تم تعديل الطبق بنجاح'
    })
  } catch (err) {
    if (err.code === 404) {
      return res.status(404).json({
        message: 'خطأ, الطبق غير موجود'
      })
    }

    res.status(500).json({
      message: 'خطأ في السيرفر',
      error: err.message
    })
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /:id/update-image
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Router.route('/:id/update-image').put(
  checkAuthentication('MENU'),
  upload.single('image'),
  handleMulterError,
  async (req, res) => {
    let newImage = null

    try {
      const key = req.params.id
      const file = req.file

      if (!file) {
        return res.status(400).json({
          message: 'يرجى ارفاق صورة'
        })
      }

      const dish = await dishCollection.document(key)
      const oldImage = dish.image

      newImage = await saveImageAsWebp(file.buffer)

      const updated = await dishCollection.update(
        key,
        {
          image: newImage
        },
        {
          returnNew: true
        }
      )

      if (oldImage && oldImage !== newImage) {
        await deleteImageFile(oldImage)
      }

      const resolvedDish = await resolveDefaultDishImage(updated.new)

      res.status(200).json({
        message: 'تم تحديث الصورة',
        data: resolvedDish
      })
    } catch (err) {
      if (newImage) {
        await deleteImageFile(newImage)
      }

      if (err.code === 404) {
        return res.status(404).json({
          message: 'الطبق غير موجود'
        })
      }

      res.status(500).json({
        message: err.message || 'Server error',
        error: err.message
      })
    }
  }
)

module.exports = Router
