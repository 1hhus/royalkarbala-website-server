const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { db } = require('../app');
const checkAuthentication = require('../middlewares/auth');
const Router = express.Router();

const dishCollection = db.collection('Dish');

const imgDir = path.join(__dirname, '..', 'public', 'imgs');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
});

const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: "حجم الملف أكبر من الحد المسموح به (5MB)" });
        }
        return res.status(400).json({ message: "حدث خطأ أثناء تحميل الملف", error: err.message });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET / — public dishes (not hidden)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/').get(async (req, res) => {
    try {
        const type = req.query.type;
        let query, bindVars;

        if (type && type !== 'null') {
            query = `
                FOR doc IN Dish
                FILTER doc.isHidden != true
                FILTER doc.category == @type OR doc.category == CONCAT("Category/", @type)
                RETURN doc
            `;
            bindVars = { type };
        } else {
            query = `
                FOR doc IN Dish
                FILTER doc.isHidden != true
                RETURN doc
            `;
            bindVars = {};
        }

        const cursor = await db.query(query, bindVars);
        const data = await cursor.all();

        res.status(200).json({ message: "success", data });
    } catch (err) {
        console.log('an error occured while gettin menu data:', err)
        res.status(500).json({ message: "خطا داخلي في السيرفر", error: err.message });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /all — all dishes (admin)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/all').get(checkAuthentication("MENU"), async (req, res) => {
    try {
        const type = req.query.type;

        let query, bindVars;

        if (type && type !== 'null') {
            query = `
                FOR doc IN Dish
                FILTER doc.category == @type
                RETURN doc
            `;
            bindVars = { type };
        } else {
            query = `FOR doc IN Dish RETURN doc`;
            bindVars = {};
        }

        const cursor = await db.query(query, bindVars);
        const data = await cursor.all();

        res.status(200).json({ message: "success", data });
    } catch (err) {
        res.status(500).json({ message: "خطا داخلي في السيرفر", error: err.message });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /update-order
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/update-order').put(checkAuthentication("MENU"), async (req, res) => {
    const { reorderedItems } = req.body;

    try {
        for (const item of reorderedItems) {
            await dishCollection.update(item._key, { order: item.order });
        }
        res.status(200).json({ message: 'Order updated successfully!' });
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ message: 'Error updating order!' });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /add-item
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/add-item').post(
    checkAuthentication("MENU"),
    upload.single('image'),
    handleMulterError,
    async (req, res) => {
        try {
            const data = req.body;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ message: "يرجى ارفاق صورة" });
            }

            const keys = Object.keys(data);
            const hasEmpty = keys.some(key => data[key] === '' || data[key] === 0);
            if (hasEmpty) {
                return res.status(400).json({ message: "يرجى ملء جميع الحقول" });
            }

            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const webpFilename = `${uniqueSuffix}.webp`;
            const webpPath = path.join(imgDir, webpFilename);

            await sharp(file.buffer).webp({ quality: 80 }).toFile(webpPath);

            // Get highest order
            const cursor = await db.query(`
                FOR doc IN Dish
                SORT doc.order DESC
                LIMIT 1
                RETURN doc.order
            `);
            const orders = await cursor.all();
            const highestOrder = orders.length > 0 ? orders[0] : 0;

            const newDish = {
                ...data,
                names: JSON.parse(data.names),
                description: JSON.parse(data.description),
                isHidden:false,
                image: webpFilename,
                order: highestOrder + 1
            };

            const result = await dishCollection.save(newDish, { returnNew: true });

            res.status(201).json({
                message: "تم أضافة الطبق بنجاح",
                data: result.new
            });
        } catch (err) {
            res.status(500).json({ message: "خطأ داخلي في السيرفر", error: err.message });
        }
    }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /:id
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/:id').get(async (req, res) => {
    try {
        const key = req.params.id;
        const dishData = await dishCollection.document(key);

        res.status(200).json({ message: "success", data: dishData });
    } catch (err) {
        if (err.code === 404) {
            return res.status(404).json({ message: "الطبق غير موجود" });
        }
        res.status(500).json({ message: "حدث خطا", error: err.message });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELETE /:id/delete
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/:id/delete').delete(checkAuthentication("MENU"), async (req, res) => {
    try {
        const key = req.params.id;
        await dishCollection.remove(key);

        res.status(200).json({ message: "تم حذف الطبق بنجاح" });
    } catch (err) {
        if (err.code === 404) {
            return res.status(404).json({ message: "الطبق غير موجود" });
        }
        res.status(500).json({ message: "internal server error", error: err.message });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /:id/toggle-hide
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/:id/toggle-hide').put(checkAuthentication('MENU'), async (req, res) => {
    try {
        const key = req.params.id;
        const dish = await dishCollection.document(key);

        const updated = await dishCollection.update(
            key,
            { isHidden: !dish.isHidden },
            { returnNew: true }
        );

        res.status(200).json({ message: "نجح", data: updated.new });
    } catch (err) {
        if (err.code === 404) {
            return res.status(404).json({ message: "الطبق غير موجود" });
        }
        res.status(500).json({ message: "حدث خطأ", error: err.message });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /:id/edit
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/:id/edit').put(checkAuthentication('MENU'), async (req, res) => {
    try {
        const key = req.params.id;
        const { image, ...updateData } = req.body;

        await dishCollection.update(key, updateData);

        res.status(200).json({ message: "تم تعديل الطبق بنجاح" });
    } catch (err) {
        if (err.code === 404) {
            return res.status(404).json({ message: "خطأ, الطبق غير موجود" });
        }
        res.status(500).json({ message: "خطا في السيرفر", error: err.message });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /:id/update-image
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Router.route('/:id/update-image').put(checkAuthentication('MENU'), upload.single('image'), async (req, res) => {
    try {
        const key = req.params.id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "يرجى ارفاق صورة" });
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const webpFilename = `${uniqueSuffix}.webp`;
        const webpPath = path.join(imgDir, webpFilename);

        await sharp(file.buffer).webp({ quality: 80 }).toFile(webpPath);

        const updated = await dishCollection.update(
            key,
            { image: webpFilename },
            { returnNew: true }
        );

        res.status(200).json({ message: "تم تحديث الصورة", data: updated.new });
    } catch (err) {
        if (err.code === 404) {
            return res.status(404).json({ message: "الطبق غير موجود" });
        }
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = Router;