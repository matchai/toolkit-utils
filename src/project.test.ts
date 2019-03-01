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

describe.each([babel, ts])(
  "Same on all projects",
  ({ project, projectRoot }) => {
    const projectName = project.name;

    it(`${projectName} should have a scriptsDir`, () => {
      expect(project.scriptsDir).toBe(
        `${projectRoot}/node_modules/toolkit/lib/scripts`
      );
      expect(project.scriptsDir).toBe(
        `${projectRoot}/node_modules/toolkit/lib/scripts`
      );
    });
  }
);
