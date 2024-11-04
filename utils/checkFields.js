const checkFields = (fields) => {
    for (const key in fields) {
        // Check if the field is present and non-empty
        if (!fields[key]) {
            throw new Error(`The field '${key}' is missing or empty.`);
        }

        // Additional checks for specific fields
        if (key === 'email') {
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
    return true; // returns true if all fields are valid
};

module.exports = checkFields;