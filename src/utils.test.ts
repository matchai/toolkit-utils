import { replaceArgumentName } from "./utils";

describe("replaceArgumentName() function", () => {
  it("replaces an argument name that exists", () => {
    expect(replaceArgumentName(["--a", "--b"], ["--a"], "--c")).toEqual([
      "--c",
      "--b"
    ]);
  });

  it("replaces an argument name that does not exist", () => {
    expect(replaceArgumentName(["--a", "--b"], ["--x"], "--c")).toEqual([
      "--a",
      "--b"
    ]);
  });
});
