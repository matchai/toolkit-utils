import fs from "fs-extra";
import os from "os";
import path from "path";
import { Project } from "../src/index";

const fixtures = path.join(__dirname, "fixtures");

export enum ProjectType {
  TypeScript = "project-ts",
  Babel = "project-babel"
}

export async function createProject(projectType: ProjectType) {
  // Create temp dir for test run containing the name of the project type
  const projectRoot = await makeTempDir(projectType);
  const { toolkitRoot } = getPaths(projectType, projectRoot);

  await Promise.all([
    fs.copy(path.join(fixtures, projectType), projectRoot),
    fs.copy(
      path.join(fixtures, "node_modules"),
      path.join(projectRoot, "node_modules")
    ),
    fs.ensureSymlink(
      path.join(__dirname, "../node_modules/.bin/concurrently"),
      path.join(projectRoot, "node_modules/.bin/concurrently")
    )
  ]);

  return {
    projectRoot,
    project: new Project({ toolkitRoot }),
  }
}

function getPaths(projectType: ProjectType, projectRoot: string) {
  return {
    toolkitRoot: path.join(projectRoot, "node_modules", "toolkit"),
    toolkitUtilsPath: path.join(
      projectRoot,
      "node_modules",
      "toolkit-utils"
    )
  };
}

async function makeTempDir(name: string): Promise<string> {
  const tempDirName = path.join(os.tmpdir(), `${name}-`);
  return fs.mkdtemp(tempDirName);
}
