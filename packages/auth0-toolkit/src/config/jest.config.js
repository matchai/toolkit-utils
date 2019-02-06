const project = require("../../lib");
debugger;

const dir = project.isCompiled ? "src" : "lib";
const useBuiltInBabelConfig =
  !project.hasAnyFile(".babelrc") && !project.package.hasOwnProperty("babel");

const jestConfig = {
  roots: [
    project.hasAnyFile("src", project.fromRoot("src"), project.fromRoot("lib"))
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  collectCoverageFrom: [`${dir}/**/*.+(js|jsx|ts|tsx)`],
  testMatch: [
    "**/__tests__/**/*.+(js|jsx|ts|tsx)",
    "**/*.(test|spec).(js|jsx|ts|tsx)"
  ]
};

if (project.isTypeScript) {
  jestConfig.transform = { "^.+\\.(js|ts|jsx|tsx)$": "ts-jest" };
  jestConfig.globals = { "ts-jest": { tsConfigFile: "tsconfig-test.json" } };
}

module.exports = jestConfig;
