const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')
const { Database } = require('arangojs')

dotenv.config()

const port = process.env.PORT || 9000

// const allowedIPs = [
//     '192.168.18.1',
//     '::ffff:192.168.18.1',   // ← IPv6 mapped format
//     '::1',
//     '127.0.0.1'
// ]

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

        const collections = ['User', 'Category', 'Dish']
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

const server = express()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. Trust Proxy (must be first)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
server.set('trust proxy', true)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. CORS (must be before routes)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
server.use(cors({
    methods: ['POST', 'GET', 'DELETE', 'PUT'],
    origin: [
        'http://localhost:3000',
        'https://royalkarbala.com',   // ← updated
        'https://www.royalkarbala.com'   // ← updated
    ],
    credentials: true,
}))

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. IP Filter
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// server.use((req, res, next) => {
//     const ip = req.ip || req.connection.remoteAddress

//     const isAllowed = allowedIPs.some(allowed => ip.includes(allowed))

//     if (isAllowed) {
//         next()
//     } else {
//         console.warn(`Blocked request from IP: ${ip}`)
//         res.status(403).json({ message: 'Forbidden' })
//     }
// })
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. General Middleware
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(cookieParser())
server.use(express.static(path.join(__dirname, 'public')))

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. Routes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
server.use('/api/menu', menuRouter)
server.use('/api/auth', authRouter)
server.use('/api/category', categoryRouter)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. Start Server
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
server.listen(port, () => {
    console.log(`App is running on port ${port}`)
})
