import { Project } from ".";
import { createProject, ProjectType } from "../test/test-helper";

let projects: { ts: Project; babel: Project };

beforeAll(async () => {
  const projectList = await Promise.all([
    createProject(ProjectType.TypeScript),
    createProject(ProjectType.Babel)
  ]);
  projects = { ts: projectList[0], babel: projectList[1] };
});

describe("Project", () => {
  it("should throw when no module root is provided", () => {
    expect(() => new Project()).toThrow("Cannot initialize project.");
  });

  it("should throw for a non-existing toolkitRoot", () => {
    expect(() => new Project({ toolkitRoot: "non-existing" })).toThrow(
      "Cannot initialize project"
    );
  });
});
