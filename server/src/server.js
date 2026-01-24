// Path: E:\EduQuest\server\src\server.js

require("dotenv").config();  // Load environment variables from .env file
const app = require("./app");  // Import the app

const PORT = process.env.PORT || 5000;  // Use port from environment or default to 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
