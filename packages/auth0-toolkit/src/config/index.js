// Exclude prettier: cascaded exports causes IDE fail.
const prettier = require("./.prettierrc.js");
const jest = require("./jest.config.js");

module.exports = { prettier, jest };
