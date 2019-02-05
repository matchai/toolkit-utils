import path from 'path';
import fs, {readJSONSync} from 'fs-extra';
import { getToolkitRoot, getProjectPackage } from './project-util';

export default class Project {
  projectName: String;
  projectRoot: String;
  projectPkg: { [key: string]: any };

  constructor({
    moduleRoot = getToolkitRoot(),
    cwd
  }: {
    moduleRoot?: string,
    cwd?: string
  } = {}) {
    try {
      const toolkitPackage = fs.readJSONSync(path.join(moduleRoot, "package.json"));
      const {pkg: projectPkg, root: projectRoot } = getProjectPackage(moduleRoot, toolkitPackage);
      this.projectName = projectPkg.name;
      this.projectRoot = projectRoot;
      this.projectPkg = projectPkg;
    } catch (e) {
      console.error(e, "Cannot initialize project.");
      process.exit(1);
    }
  }
}
