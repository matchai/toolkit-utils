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
  const projectRoot = await makeTempDir();
  const { toolkitRoot } = getPaths(projectType, projectRoot);

  await Promise.all([
    fs.copy(path.join(fixtures, projectType), projectRoot),
    fs.copy(
      path.join(fixtures, "node_modules"),
      path.join(projectRoot, "node_modules")
    ),
    fs.ensureSymlink(
      path.join(__dirname, "../../node_modules/.bin/concurrently"),
      path.join(projectRoot, "node_modules/.bin/concurrently")
    )
  ]);

  return new Project({ toolkitRoot });
}

function getPaths(projectType: ProjectType, projectRoot: string) {
  return {
    toolkitRoot: path.join(projectRoot, projectType, "node_modules", "toolkit"),
    toolkitUtilsPath: path.join(
      projectRoot,
      projectType,
      "node_modules",
      "toolkit-utils"
    )
  };
}

async function makeTempDir() {
  const tempDirName = path.join(os.tmpdir(), "tk-utils-");
  return fs.mkdtemp(tempDirName);
}

export const stubLogger: BasicLogger = {
  debug: () => {},
  error: () => {},
  info: () => {},
  silly: () => {},
  verbose: () => {},
  warn: () => {}
};
