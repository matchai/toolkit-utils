import path from "path";
import ScriptKit from "./script-kit";
import { createProject, ProjectType } from "../test/test-helper";

const { project, projectRoot } = createProject(ProjectType.TypeScript);
const scriptKit = new ScriptKit(project, "multiple-results");

describe("ScriptKit", () => {
  it("should create an instance of ScriptKit", () => {
    expect(scriptKit).toBeInstanceOf(ScriptKit);
  });

  it("should throw when no script file can be found", () => {
    expect(() => new ScriptKit(project, "non-existing")).toThrowError(
      /^Script \"non-existing\" cannot be found/
    );
  });

  it("should have a dir", () => {
    expect(scriptKit.dir).toBe(project.scriptsDir);
  });

  it("should have a configDir", () => {
    expect(scriptKit.configDir).toBe(project.configDir);
  });

  it("should have an extension", () => {
    expect(scriptKit.extension).toBe("js");
  });

  it("should have a here() method", () => {
    expect(scriptKit.here("a")).toBe(project.fromScriptsDir("a"));
  });

  it("should have a hereRelative() method", () => {
    const base = path.relative(__dirname, projectRoot);
    const binPath = path.join(base, "node_modules/toolkit/lib/scripts/a");
    expect(scriptKit.hereRelative("a")).toBe(binPath.replace("..", "."));
  });

  it("should have an executeSubscript() method", () => {
    const result = project.executeScriptFile("super-script");
    expect(result).toEqual({ status: 0 });
  });
});
