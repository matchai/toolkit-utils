import path from 'path';
import fs, {readJSONSync} from 'fs-extra';
import { getModuleRoot } from './project-util';

export default class Project {
  constructor({
    moduleRoot = getModuleRoot(),
    cwd
  }: {
    moduleRoot?: string,
    cwd?: string
  } = {}) {
    try {
      const modulePackage = fs.readJSONSync(path.join(moduleRoot, "package.json"));
      console.log(modulePackage);
      // const {pkg: projectPkg, root: projectRoot } = getProjectPackage(moduleRoot, modulePackage);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
}
