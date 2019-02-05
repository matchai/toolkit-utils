import path from 'path';
import fs from 'fs-extra';
import globby from 'globby';
import { getToolkitRoot, getProjectPackage } from './project-util';

export default class Project {
  projectName: String;
  projectRoot: String;
  projectPkg: { [key: string]: any };

  constructor({
    toolkitRoot = getToolkitRoot(),
    cwd
  }: {
    toolkitRoot?: string,
    cwd?: string
  } = {}) {
    try {
      const toolkitPackage = fs.readJSONSync(path.join(toolkitRoot, "package.json"));
      const {pkg: projectPkg, root: projectRoot } = getProjectPackage(toolkitRoot, toolkitPackage);
      this.projectName = projectPkg.name;
      this.projectRoot = projectRoot;
      this.projectPkg = projectPkg;

      console.log(this.availableScripts)

      // if (debug) {
      //   this.logger.warn("Debug mode is on");
      // }
    } catch (e) {
      console.error(e, "Cannot initialize project.");
      process.exit(1);
    }
  }

  /**
   * List of scripts available in this toolkit
   * @readonly
   * @type {Array.<string>}
   */
  get availableScripts(): Array<string> {
    // `globby` returns a list of unix style paths
    // We normalize it and script out paths and file extensions
    return globby
    .sync(path.join(this.scriptsDir, "!(*.d.ts|*.map)"))
    .map(path.normalize)
    .map(script => 
      script
        .replace(this.scriptsDir, "")
        .replace(/^[/\\]/, "")
        .replace(/\.(js|ts)$/, "")
    )
    .filter(Boolean)
    .sort();
  }

  /**
   * Path of the scripts dir
   * @readonly
   * @type {string}
   */
  get scriptsDir() {
    return path.join(this.srcDir, "scripts");
  }

  /**
   * Path of the src dir
   * @readonly
   * @type {string}
   */
  get srcDir() {
    return path.dirname(require!.main!.filename);
  }
}
