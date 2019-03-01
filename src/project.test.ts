import { Project } from ".";
import { createProject, ProjectType } from "../test/test-helper";

let projects: { ts: Project; babel: Project };
let projectRoots: { ts: string; babel: string };

beforeAll(async () => {
  const projectList = await Promise.all([
    createProject(ProjectType.TypeScript),
    createProject(ProjectType.Babel)
  ]);
  projects = { ts: projectList[0].project, babel: projectList[1].project };
  projectRoots = { ts: projectList[0].projectRoot, babel: projectList[1].projectRoot};
});

describe("Project", () => {
  it("should throw when no toolkit root can be found", () => {
    expect(() => new Project()).toThrowError('Cannot get module root.');
  });

  it("should throw for a non-existing toolkit root", () => {
    expect(() => new Project({ toolkitRoot: "non-existing" })).toThrowError(/^Cannot initialize project./)
  });

  it("should have a srcDir", () => {
    expect(projects.ts.srcDir).toBe(`${projectRoots.ts}/node_modules/toolkit/src`)
  });
});
