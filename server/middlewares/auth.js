const jwt = require('jsonwebtoken');
const { db } = require('../app'); // adjust path to your ArangoDB connection

function checkAuthentication(requiredPermission = null) {
    return async (req, res, next) => {
        try {
            const token = req.cookies?.token;
            if (!token) {
                return res.status(401).json({ message: "تم حظر الدخول, لا توجد صلاحية للدخول" });
            }

            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.user = decoded;

            if (requiredPermission) {
                const cursor = await db.query(
                    'FOR u IN User FILTER u._key == @id RETURN u',
                    { id: String(decoded.data) }
                );
                const user = await cursor.next();

                if (!user) {
                    return res.status(404).json({ message: "المستخدم غير موجود" });
                }

                if (!Array.isArray(user.permissions) || !user.permissions.includes(requiredPermission)) {
                    return res.status(403).json({ message: "لا تملك الصلاحية للوصول إلى هذا القسم" });
                }
            }

            next();
        } catch (err) {
            res.status(401).json({ message: "Invalid token or authentication failed", error: err.message });
        }
    };
}

module.exports = checkAuthentication;