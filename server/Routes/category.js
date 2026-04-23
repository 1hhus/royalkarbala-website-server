const express = require("express")
const checkAuthentication = require('../middlewares/auth')
const { db } = require('../app')
const Router = express.Router()

const categoryCollection = db.collection('Category')

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET / — visible categories only
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/').get(async (req, res) => {
    try {
        const cursor = await db.query(`
            FOR doc IN Category
            FILTER doc.isHidden == false
            SORT doc.order ASC
            RETURN doc
        `)
        const data = await cursor.all()

        res.status(200).json({ message: "success", data })
    } catch (err) {
        console.log('an error occured while gettin categories data:', err)
        res.status(500).json({ message: "حدث خط:::::أ", error: err })
    }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /all — all categories
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/all').get(async (req, res) => {
    try {
        const cursor = await db.query(`
            FOR doc IN Category
            SORT doc.order ASC
            RETURN doc
        `)
        const data = await cursor.all()

        res.status(200).json({ message: "success", data })
    } catch (err) {
        res.status(500).json({ message: "حدث خطأ", error: err.message })
    }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /update-order
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/update-order').put(checkAuthentication("MENU"), async (req, res) => {
    const { reorderedItems } = req.body
    try {
        for (const item of reorderedItems) {
            await categoryCollection.update(item._key, { order: item.order })
        }
        res.status(200).json({ message: 'Order updated successfully!' })
    } catch (err) {
        console.error('Error updating order:', err)
        res.status(500).json({ message: 'Error updating order!' })
    }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /add
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/add').post(checkAuthentication("MENU"), async (req, res) => {
    try {
        const data = req.body

        const cursor = await db.query(`
            FOR doc IN Category
            SORT doc.order DESC
            LIMIT 1
            RETURN doc.order
        `)
        const orders = await cursor.all()
        const highestOrder = orders.length > 0 ? orders[0] : 0

        await categoryCollection.save({ ...data, order: highestOrder + 1, isHidden:false })

        res.status(201).json({ message: "تم أضافة الفئة بنجاح" })
    } catch (err) {
        res.status(500).json({ message: "حدث خطا", error: err.message })
    }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /:id/hide
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/:id/hide').put(checkAuthentication("MENU"), async (req, res) => {
    try {
        const key = req.params.id
        const category = await categoryCollection.document(key)

        await categoryCollection.update(key, { isHidden: !category.isHidden })

        res.status(200).json({ message: "تم تعديل حالة الفئة بنجاح" })
    } catch (err) {
        if (err.code === 404) {
            return res.status(404).json({ message: "الفئة غير موجودة" })
        }
        res.status(500).json({ message: "مشكلة في السيرفر", error: err.message })
    }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /:id/edit
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/:id/edit').put(checkAuthentication("MENU"), async (req, res) => {
    try {
        const key = req.params.id
        const data = req.body

        await categoryCollection.update(key, data)

        res.status(200).json({ message: "تم تعديل الفئة بنجاح" })
    } catch (err) {
        if (err.code === 404) {
            return res.status(404).json({ message: "الفئة غير موجودة" })
        }
        res.status(500).json({ message: "مشكلة في السيرفر", error: err.message })
    }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELETE /:id/delete
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/:id/delete').delete(checkAuthentication("MENU"), async (req, res) => {
    try {
        const key = req.params.id
        await categoryCollection.remove(key)

        res.status(200).json({ message: "تم حذف الفئة بنجاح" })
    } catch (err) {
        if (err.code === 404) {
            return res.status(404).json({ message: "الفئة غير موجودة" })
        }
        res.status(500).json({ message: "حدث خطأ", error: err.message })
    }
})

module.exports = Router
