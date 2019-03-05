import fs from "fs";
import generate from "nanoid/generate";
import path from "path";
import { IScriptResult, Project } from ".";
import { createProject, ProjectType } from "../test/test-helper";

// Create variables outside of before all to be able to use `.each`
const babel = createProject(ProjectType.Babel);
const ts = createProject(ProjectType.TypeScript);

describe("Project creation", () => {
  it("should throw when no toolkit root can be found", () => {
    expect(() => new Project()).toThrowError("Cannot get module root.");
  });

  it("should throw for a non-existing toolkit root", () => {
    expect(() => new Project({ toolkitRoot: "non-existing" })).toThrowError(
      /^Cannot initialize project./
    );
  });
});

describe("Project dependant", () => {
  it("should have a name", () => {
    expect(babel.project.name).toBe("project-babel");
    expect(ts.project.name).toBe("project-ts");
  });

  it(`should have isCompiled`, () => {
    expect(babel.project.isCompiled).toBe(true);
    expect(ts.project.isCompiled).toBe(true);
  });

  it(`should have isTypeScript`, () => {
    expect(babel.project.isTypeScript).toBe(false);
    expect(ts.project.isTypeScript).toBe(true);
  });
});

describe("Project file manipulation", () => {
  describe("packageSet() method", () => {
    it("overwrites existing package.json properties", () => {
      const { project } = createProject(ProjectType.Babel);

      project.packageSet("scripts.test", "echo 'Hello world!'");
      expect(project.packageGet("scripts.test")).toBe("echo 'Hello world!'");
    });

    it("creates new package.json properties", () => {
      const { project } = createProject(ProjectType.Babel);

      project.packageSet("scripts.exampleScript", "echo 'Hello world!'");
      expect(project.packageGet("scripts.exampleScript")).toBe(
        "echo 'Hello world!'"
      );
    });
  });

  describe("writeFile() method", () => {
    it("fails to create files with null or undefined data", () => {
      const { project } = createProject(ProjectType.Babel);

      expect(() => project.writeFile("package.json", null)).toThrowError(
        "Cannot write file. File data cannot be null or undefined."
      );
      expect(() => project.writeFile("package.json", undefined)).toThrowError(
        "Cannot write file. File data cannot be null or undefined."
      );
    });
  });

  describe("copyFile() method", () => {
    it("creates a copy of the source file", () => {
      const { project, projectRoot } = createProject(ProjectType.Babel);

      project.copyFile("text-file.txt", "copied-file.txt");
      const copiedFile = fs.readFileSync(
        path.join(projectRoot, "copied-file.txt"),
        "utf8"
      );

      expect(copiedFile).toBe("Hello world!\n");
    });

    it("fails to copy a non-existant file", () => {
      const { project } = createProject(ProjectType.Babel);
      expect(() =>
        project.copyFile("non-existant.file", "copied-file.txt")
      ).toThrowError(/^Cannot copy file:/);
    });
  });
});

describe.each([babel, ts])(
  "Same on all projects",
  ({ project, projectRoot }) => {
    const projectName = project.name;

    it(`${projectName} - should have a scriptsDir`, () => {
      expect(project.scriptsDir).toBe(
        path.join(projectRoot, "node_modules/toolkit/lib/scripts")
      );
    });

    it(`${projectName} - should have a configDir`, () => {
      expect(project.configDir).toBe(
        path.join(projectRoot, "node_modules/toolkit/lib/config")
      );
    });

    it(`${projectName} - should have a toolkitName`, () => {
      expect(project.toolkitName).toBe("toolkit");
    });

    it(`${projectName} - should have a toolkitRootDir`, () => {
      expect(project.toolkitRootDir).toBe(
        path.join(projectRoot, "node_modules/toolkit")
      );
    });

    it(`${projectName} - should have availableScripts`, () => {
      expect(project.availableScripts).toEqual([
        "create-file",
        "error-script",
        "multiple-results",
        "non-exiting",
        "non-exporting",
        "super-script",
        "throw-script",
        "ts-script"
      ]);
    });

    it(`${projectName} - should have a package`, () => {
      expect(project.package).toMatchObject({
        author: "",
        description: "",
        license: "MIT",
        main: "index.js",
        name: projectName,
        scripts: {
          test: 'echo "Error: no test specified" && exit 1'
        },
        version: "1.0.0"
      });
    });

    it(`${projectName} - should have toolkitBin`, () => {
      expect(project.toolkitBin).toBe("toolkit");
    });

    it(`${projectName} - should call fromToolkitRoot()`, () => {
      expect(project.fromToolkitRoot("a")).toBe(
        path.join(projectRoot, "node_modules/toolkit/a")
      );
    });

    it(`${projectName} - should call fromConfigDir()`, () => {
      expect(project.fromConfigDir("a")).toBe(
        path.join(projectRoot, "node_modules/toolkit/lib/config/a")
      );
    });

    it(`${projectName} - should call fromScriptsDir()`, () => {
      expect(project.fromScriptsDir("a")).toBe(
        path.join(projectRoot, "node_modules/toolkit/lib/scripts/a")
      );
    });

    describe(`${projectName} - hasAnyDep() method`, () => {
      it("should return true for existing dependencies", () => {
        expect(project.hasAnyDep("dotenv")).toBe(true);
        expect(project.hasAnyDep("eslint")).toBe(true);
        expect(project.hasAnyDep("browserify")).toBe(true);
        expect(project.hasAnyDep(["dotenv", "eslint", "browserify"])).toBe(
          true
        );
      });

      it("should return false for non-existing dependencies", () => {
        expect(project.hasAnyDep("fakeDependency")).toBe(false);
      });
    });

    describe(`${projectName} - envIsSet() method`, () => {
      it("should return true for existing environment variables", () => {
        const varName = randomString();
        process.env[varName] = "value";
        expect(project.envIsSet(varName)).toBe(true);
      });

      it("should return false for non-existing environment variables", () => {
        expect(project.envIsSet("fakeEnvVariable")).toBe(false);
      });
    });

    describe(`${projectName} - parseEnv() method`, () => {
      it("should return true for existing environment variables", () => {
        const varName = randomString();
        const varValue = randomString();
        process.env[varName] = varValue;
        expect(project.parseEnv(varName)).toBe(varValue);
      });

      it("should return default for non-existing environment variables", () => {
        const defaultValue = randomString();
        expect(project.parseEnv("fakeEnvVariable", defaultValue)).toBe(
          defaultValue
        );
      });

      it("should return undefined for non-existing environment variables", () => {
        expect(project.parseEnv("fakeEnvVariable")).toBe(undefined);
      });
    });

    describe(`${projectName} - packageHas() method`, () => {
      it("should return true for existing JSON paths", () => {
        expect(project.packageHas(["scripts", "test"])).toBe(true);
        expect(project.packageHas("scripts.test")).toBe(true);
      });

      it("should return false for non-existing JSON paths", () => {
        expect(project.packageHas(["nonExisting", "path"])).toBe(false);
        expect(project.packageHas("scripts.doesntExist")).toBe(false);
      });
    });

    describe(`${projectName} - packageGet() method`, () => {
      it("should return the value for existing JSON paths", () => {
        expect(project.packageGet("version")).toBe("1.0.0");
      });

      it("should return undefined for non-existing JSON paths", () => {
        expect(project.packageGet(["nonExisting", "path"])).toBe(undefined);
        expect(project.packageGet("scripts.doesntExist")).toBe(undefined);
      });
    });

    describe(`${projectName} - hasScript() method`, () => {
      it("should return a script .js file", () => {
        expect(project.hasScript("create-file")).toBe(
          path.join(
            projectRoot,
            "node_modules/toolkit/lib/scripts/create-file.js"
          )
        );
      });

      it("should return a script .ts file", () => {
        expect(project.hasScript("ts-script")).toBe(
          path.join(
            projectRoot,
            "node_modules/toolkit/lib/scripts/ts-script.ts"
          )
        );
      });

      it("should return a super-script folder", () => {
        expect(project.hasScript("super-script")).toBe(
          path.join(
            projectRoot,
            "node_modules/toolkit/lib/scripts/super-script"
          )
        );
      });

      it("should return null for a non-existant script", () => {
        expect(project.hasScript("nonExistant")).toBe(null);
      });
    });

    describe(`${projectName} - hasAnyFile() method`, () => {
      it("should return true for an existing file", () => {
        expect(project.hasAnyFile("package.json")).toBe(true);
      });

      it("should return false for a non-existing file", () => {
        expect(project.hasAnyFile("non-existing.file")).toBe(false);
      });

      it("should return true for one existing and multiple non-existing files", () => {
        expect(
          project.hasAnyFile([
            "non-existing.file",
            "package.json",
            "another-nonexisting.file"
          ])
        ).toBe(true);
      });
    });

    describe(`${projectName} - bin() method`, () => {
      it("returns the relative path to the executable bin", () => {
        const base = path.relative(__dirname, projectRoot);
        const binPath = path.join(base, "node_modules/.bin/concurrently");
        expect(project.bin("concurrently")).toBe(binPath.replace("..", "."));
      });
    });

    describe(`${projectName} - getConcurrentlyArgs() method`, () => {
      it(`should get concurrently args and kill others on fail`, () => {
        expect(
          project.getConcurrentlyArgs({ build: "echo 'building now'" })
        ).toEqual([
          "--kill-others-on-fail",
          "--prefix",
          "[{name}]",
          "--names",
          "build",
          "--prefix-colors",
          "bgBlue.bold.reset",
          "\"echo 'building now'\""
        ]);
      });

      it(`should get concurrently args and not kill others on fail`, () => {
        expect(
          project.getConcurrentlyArgs(
            { build: "echo 'building now'" },
            { killOthers: false }
          )
        ).toEqual([
          "--prefix",
          "[{name}]",
          "--names",
          "build",
          "--prefix-colors",
          "bgBlue.bold.reset",
          "\"echo 'building now'\""
        ]);
      });
    });

    describe(`${projectName} - executeScriptFile() method`, () => {
      it("should execute a script from the scripts directory", () => {
        const result = project.executeScriptFile("multiple-results") as any[];
        expect(result).toHaveLength(2);
      });

      it("should throw when no script function is available", () => {
        expect(() => project.executeScriptFile("ts-script")).toThrowError(
          '"ts-script" does not export a "script" function.'
        );
      });
    });

    describe(`${projectName} - executeFromCLI() method`, () => {
      /* tslint:disable */
      beforeAll(() => {
        process.exit = jest.fn((code?: number) => ({
          exitCode: code
        })) as never;
        console.log = jest.fn(() => {});
      });

      afterAll(() => {
        process.exit.mockRestore();
        console.log.mockRestore();
      });
      /* tslint:enable */

      it("should exit with error code for non-existing script", () => {
        process.argv = ["node", "src", "non-existing-script"];
        const result = project.executeFromCLI();
        expect(result).toEqual({ exitCode: 1 });
      });

      it("should return with undefined for non-existing script (exit = false)", () => {
        process.argv = ["node", "src", "non-existing-script"];
        const result = project.executeFromCLI({ exit: false });
        expect(result).toEqual(undefined);
      });

      it("should return with undefined if no script is given (exit = false)", () => {
        process.argv = ["node", "src"];
        const result = project.executeFromCLI({ exit: false });
        expect(result).toEqual(undefined);
      });

      it("should not process.exit() from script (exit = false)", () => {
        process.argv = ["node", "src", "non-exiting"];
        const result = project.executeFromCLI() as IScriptResult;
        expect(result).toEqual({ exit: false, status: 0 });
      });

      it("should return an exit code from a script with a single result", () => {
        process.argv = ["node", "src", "create-file"];
        const result = project.executeFromCLI() as IScriptResult;
        const content = fs.readFileSync(
          path.join(projectRoot, "created-by-script.txt"),
          "utf8"
        );
        expect(content).toBe("cli\n");
        expect(result).toEqual({ exitCode: 0 });
      });

      it("should return an exit code from a script with a single result (exit = false)", () => {
        process.argv = ["node", "src", "create-file"];
        const result = project.executeFromCLI({ exit: false }) as IScriptResult;
        const content = fs.readFileSync(
          path.join(projectRoot, "created-by-script.txt"),
          "utf8"
        );
        expect(content).toBe("cli\n");
        expect(result).toEqual({ status: 0 });
      });

      it("should return with undefined for non-existing script (exit = false)", () => {
        process.argv = ["node", "src", "multiple-results"];
        const result = project.executeFromCLI({
          exit: false
        }) as IScriptResult[];
        expect(result).toEqual([{ status: 0 }, { status: 0 }]);
      });

      it("should return an exit code for scripts returning errors", () => {
        process.argv = ["node", "src", "error-script"];
        const result = project.executeFromCLI() as IScriptResult;
        expect(result).toEqual({ exitCode: 1 });
      });

      it("should return an exit code for scripts returning errors (exit = false)", () => {
        process.argv = ["node", "src", "error-script"];
        const result = project.executeFromCLI({
          exit: false
        }) as IScriptResult[];
        expect(result).toEqual([
          { status: 1, error: new Error("error object") },
          { status: 1, error: "text" },
          { status: 1 }
        ]);
      });

      it("should throw if a script throws (exit = false)", () => {
        process.argv = ["node", "src", "throw-script"];
        expect(() => project.executeFromCLI({ exit: false })).toThrowError(
          /^Cannot finish the execution of \"src throw-script\"/
        );
      });

      it("should throw if a script file does not export a script", () => {
        process.argv = ["node", "src", "non-exporting"];
        expect(() => project.executeFromCLI()).toThrowError(
          /\"non-exporting\" does not export a \"script\" function.$/
        );
      });
    });

    describe(`${projectName} - execute() method`, () => {
      it("should execute a single command", () => {
        const result = project.execute("echo");
        expect(result.status).toBe(0);
      });

      it("should execute a single failing command", () => {
        const result = project.execute("non-existing-command");
        expect(result.error).toBeDefined();
      });

      it("should execute a single command with parameters", () => {
        const result = project.execute(["echo", [""]]);
        expect(result.status).toBe(0);
      });

      it("should execute multiple commands", () => {
        const result = project.execute(["echo", ["echo", [""]]]);
        expect(result.status).toBe(0);
      });

      it("should execute multiple commands with some failures", () => {
        const result = project.execute("echo", "non-existing-command", [
          "echo",
          [""]
        ]);
        expect(result.error).toBeDefined();
        expect(result.previousResults).toHaveLength(1);
      });

      it("should execute multiple concurrent commands", () => {
        const result = project.execute({
          echo1: "echo",
          echo2: ["echo", [""]]
        });
        expect(result.status).toBe(0);
      });

      it("should execute multiple serial and concurrent commands", () => {
        const result = project.execute(
          ["echo", [""]],
          null,
          { echo1: "echo", echo2: ["echo", [""]] },
          ["echo", [""]]
        );
        expect(result.status).toBe(0);
      });

      it("should return success if no commands provided", () => {
        const result = project.execute();
        expect(result.status).toBe(0);
      });

      it("should return success if all concurrently args are empty", () => {
        const result = project.execute({
          lint: null,
          test: null,
          typescript: null
        });
        expect(result.status).toBe(0);
      });
    });
  }
);

function randomString() {
  return generate("abcdefghijklmnopqrstuvwxyz", 10);
}
