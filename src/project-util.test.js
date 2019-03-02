import { getToolkitRoot, getProjectPackage } from "./project-util";

describe("getToolkitRoot() function", () => {
  it("should throw when unable to locate caller using stack", () => {
    expect(() => getToolkitRoot()).toThrow("Cannot get module root");
  });
});

describe("getProjectPackage() function", () => {
  it("should throw if package.json cannot be found up the directory tree", () => {
    expect(() => getProjectPackage("..", {})).toThrow(
      "Cannot find project root"
    );
  });

  it("should throw if package.json cannot be found up the directory tree and the current file is not in a js module", () => {
    expect(() => getProjectPackage(".", {})).toThrow(
      "Cannot find project root"
    );
  });
});
