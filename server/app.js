const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')
const { Database } = require('arangojs')

dotenv.config()

const port = process.env.PORT || 9000

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// إعداد الاتصال بـ ArangoDB
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const db = new Database({
  url: process.env.DB_URL,
  databaseName: process.env.DB_NAME,
  auth: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// تهيئة قاعدة البيانات
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function initDB() {
  try {
    const systemDb = new Database({
      url: process.env.DB_URL,
      databaseName: '_system',
      auth: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
      }
    })

    const exists = await systemDb.database(process.env.DB_NAME).exists()

    if (!exists) {
      console.log('Database does not exist, creating...')
      await systemDb.createDatabase(process.env.DB_NAME)
      console.log('Database created successfully')
    }

    const collections = ['User', 'Category', 'Dish', 'Settings']

    for (const name of collections) {
      const collection = db.collection(name)
      const collectionExists = await collection.exists()

      if (!collectionExists) {
        await collection.create()
        console.log(`Collection "${name}" created`)
      }
    }

    console.log('Database connected successfully')
  } catch (err) {
    console.error('An error occurred: ', err)
  }
}

initDB()

module.exports = { db }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// إعداد Express
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const menuRouter = require('./Routes/menu')
const authRouter = require('./Routes/auth')
const categoryRouter = require('./Routes/category')
const settingsRouter = require('./Routes/settings')

const server = express()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. Trust Proxy
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

server.set('trust proxy', true)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. CORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

server.use(cors({
  methods: ['POST', 'GET', 'DELETE', 'PUT'],
  origin: [
    'http://localhost:3000',
    'https://royalkarbala.com',
    'https://www.royalkarbala.com'
  ],
  credentials: true
}))

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. General Middleware
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(cookieParser())
server.use(express.static(path.join(__dirname, 'public')))

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. Routes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

server.use('/api/menu', menuRouter)
server.use('/api/auth', authRouter)
server.use('/api/category', categoryRouter)
server.use('/api/settings', settingsRouter)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. Start Server
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

server.listen(port, () => {
  console.log(`App is running on port ${port}`)
})
