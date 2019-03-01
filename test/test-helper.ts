import fs from "fs-extra";
import os from "os";
import path from "path";
import { Signale } from "signale";
import { Project } from "../src/index";

const fixtures = path.join(__dirname, "fixtures");

export enum ProjectType {
  TypeScript = "project-ts",
  Babel = "project-babel"
}

export function createProject(projectType: ProjectType) {
  // Create temp dir for test run containing the name of the project type
  const projectRoot = makeTempDir(projectType);
  const { toolkitRoot } = getPaths(projectType, projectRoot);

  fs.copySync(path.join(fixtures, projectType), projectRoot),
    fs.copySync(
      path.join(fixtures, "node_modules"),
      path.join(projectRoot, "node_modules")
    ),
    fs.ensureSymlinkSync(
      path.join(__dirname, "../node_modules/.bin/concurrently"),
      path.join(projectRoot, "node_modules/.bin/concurrently")
    );

  return {
    projectRoot,
    project: new Project({
      toolkitRoot,
      filesDir: path.join(toolkitRoot, "lib"),
      logger: new Signale({ disabled: true }) // Stub out logger
    })
  };
}

function getPaths(projectType: ProjectType, projectRoot: string) {
  return {
    toolkitRoot: path.join(projectRoot, "node_modules", "toolkit"),
    toolkitUtilsPath: path.join(projectRoot, "node_modules", "toolkit-utils")
  };
}

function makeTempDir(name: string): string {
  const tempDirName = path.join(os.tmpdir(), `${name}-`);
  return fs.mkdtempSync(tempDirName);
}
