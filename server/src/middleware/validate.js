// Path: E:\EduQuest\server\src\middleware\validate.js

/**
 * Simple validation middleware factory.
 * Usage: validate({ title: "required", price: "number" })
 *
 * Rules supported:
 *   "required"         — field must exist and not be empty
 *   "number"           — field must be a valid number if provided
 *   "email"            — field must look like an email if provided
 *   "min:N"            — string must be at least N chars if provided
 *   "max:N"            — string must be at most N chars if provided
 *   "range:MIN,MAX"    — number must be between MIN and MAX if provided
 */
function validate(rules) {
  return (req, res, next) => {
    const errors = [];
    const body = req.body || {};

    for (const [field, ruleStr] of Object.entries(rules)) {
      const ruleList = ruleStr.split("|").map((r) => r.trim());
      const value = body[field];

      // FIX: 0 and false are valid values — only undefined/null/"" are empty
      const isEmpty = value === undefined || value === null || value === "";

      for (const rule of ruleList) {
        // required
        if (rule === "required") {
          if (isEmpty) {
            errors.push({ field, message: `${field} is required` });
            break;
          }
        }

        // Skip further checks if value not provided (optional field)
        if (isEmpty) break;

        // number
        if (rule === "number") {
          if (isNaN(Number(value))) {
            errors.push({ field, message: `${field} must be a number` });
          }
        }

        // email
        if (rule === "email") {
          const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailReg.test(String(value))) {
            errors.push({ field, message: `${field} must be a valid email` });
          }
        }

        // min:N
        if (rule.startsWith("min:")) {
          const min = parseInt(rule.split(":")[1]);
          if (String(value).length < min) {
            errors.push({ field, message: `${field} must be at least ${min} characters` });
          }
        }

        // max:N
        if (rule.startsWith("max:")) {
          const max = parseInt(rule.split(":")[1]);
          if (String(value).length > max) {
            errors.push({ field, message: `${field} must be at most ${max} characters` });
          }
        }

        // range:MIN,MAX
        // FIX: convert to number first before comparing
        if (rule.startsWith("range:")) {
          const [min, max] = rule.split(":")[1].split(",").map(Number);
          const num = Number(value);
          if (isNaN(num) || num < min || num > max) {
            errors.push({ field, message: `${field} must be between ${min} and ${max}` });
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    next();
  };
}

module.exports = { validate };
