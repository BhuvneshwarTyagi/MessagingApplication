const checkFields = (fields) => {
    for (const key in fields) {

        if (!fields[key]) {
            throw new Error(`The field '${key}' is missing or empty.`);
        }

        // Additional checks for specific fields
        if (key === 'Email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(fields[key])) {
                throw new Error("Invalid email format.");
            }
        }

        if (key === 'password') {
            if (fields[key].length < 8) {
                throw new Error("Password must be at least 8 characters long.");
            }
        }
    }
    return true; 
};

const checkUserExists = (userId,connection) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT COUNT(*) AS count FROM users WHERE id = ?`;
        connection.query(sql, [userId], (err, results) => {
            if (err) return reject(err);
            resolve(results[0].count > 0);
        });
    });
};
module.exports = {checkFields,checkUserExists};