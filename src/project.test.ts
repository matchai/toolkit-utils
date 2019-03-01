import generate from "nanoid/generate";
import path from "path";
import { Project } from ".";
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
      expect(project.availableScripts).toEqual(["create-file"]);
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
  }
);

function randomString() {
  return generate("1234567890abcdef", 10);
}
