const defaultConfig = require("auth0-toolkit/config").jest;

module.exports = {
  ...defaultConfig,
  // Source test support files from anywhere
  modulePaths: [`<rootDir>/test`]
};
