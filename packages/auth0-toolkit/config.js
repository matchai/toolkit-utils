const fs = require("fs");
const path = require("path");

const config = fs.existsSync(path.join(__dirname, "src")) ? require("./src/config") : require("./lib/config");

module.exports = config;
