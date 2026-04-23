const express = require('express')
const Router = express.Router()
const { db } = require('../app')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const checkAuthentication = require('../middlewares/auth')

const userCollection = db.collection('User')

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /get — all users
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/get').get(checkAuthentication("USERS"), async (req, res) => {
    try {
        const cursor = await db.query(`
            FOR doc IN User
            RETURN UNSET(doc, "password")
        `)
        const data = await cursor.all()

        res.status(200).json({ message: "success", data })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error", error: err.message })
    }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /create — create user
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/create').post(checkAuthentication("USERS"), async (req, res) => {
    try {
        const data = req.body

        if (!data.password || !data.name) {
            return res.status(400).json({ message: "يرجى ملء جميع الحقول" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(data.password, salt)

        const result = await userCollection.save(
            { ...data, password: hashedPassword, permissions: ['MENU', "USERS"] },
            { returnNew: true }
        )

        // Return user without password
        const { password, ...newUser } = result.new

        res.status(201).json({ message: "تم انشاء المستخدم بنجاح", data: newUser })
    } catch (err) {
        res.status(500).json({ message: "خطا داخلي في السيرفر", error: err.message })
    }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /login
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/login').post(async (req, res) => {
    try {
        const { name: username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({ message: "يرجى ملء جميع الحقول" })
        }

        // Find user by name
        const cursor = await db.query(`
            FOR doc IN User
            FILTER doc.name == @username
            LIMIT 1
            RETURN doc
        `, { username })
        const users = await cursor.all()

        if (users.length === 0) {
            return res.status(404).json({ message: "المستخدم غير موجود" })
        }

        const checkUser = users[0]

        const isMatch = await bcrypt.compare(password, checkUser.password)
        if (!isMatch) {
            return res.status(400).json({ message: "كلمة المرور غير صحيحة" })
        }

        const token = jwt.sign(
            { data: checkUser._key },
            process.env.SECRET_KEY,
            { expiresIn: '24h' }
        )

        res.status(200).cookie('token', token).json({ message: "تم تسجيل الدخول بنجاح" })
    } catch (err) {
        console.log('Error while logging in', err)
        res.status(500).json({ message: "خطا داخلي في السيرفر", error: err })
    }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /check-auth
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/check-auth').get(async (req, res) => {
    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({ message: "رمز غير موجود, يرجى تسجيل الدخول" })
        }

        const verify = jwt.verify(token, process.env.SECRET_KEY)

        if (verify) {
            res.status(200).json({ message: "تم تاكيد الوصول" })
        } else {
            res.status(400).json({ message: "رمز غير صالح, يرجى تسجيل الدخول" })
        }
    } catch (err) {
        res.status(500).json({ message: "خطا داخلي في السيرفر", error: err.message })
    }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /logout
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/logout').post(async (req, res) => {
    try {
        res.clearCookie('token').status(200).json({ message: "تم تسجيل الخروج بنجاح" })
    } catch (err) {
        res.status(500).json({ message: "خطأ داخلي في السيرفر" })
    }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELETE /:id/delete
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/:id/delete').delete(checkAuthentication("USERS"), async (req, res) => {
    try {
        const key = req.params.id
        await userCollection.remove(key)

        res.status(200).json({ message: "تم حذف المستخدم بنجاح" })
    } catch (err) {
        if (err.code === 404) {
            return res.status(404).json({ message: "خطأ, المستخدم غير موجود" })
        }
        res.status(500).json({ message: "internal server error", error: err.message })
    }
})

module.exports = Router