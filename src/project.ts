import path from 'path';
import fs from 'fs-extra';
import globby from 'globby';
import logger from 'consola';
import { getToolkitRoot, getProjectPackage } from './helpers/project-util';

export default class Project {
  projectName: String;
  projectRoot: String;
  projectPkg: { [key: string]: any };

  constructor({
    toolkitRoot = getToolkitRoot(),
    cwd,
    debug = false
  }: {
    toolkitRoot?: string,
    cwd?: string,
    debug?: boolean
  } = {}) {
    try {
      const toolkitPackage = fs.readJSONSync(path.join(toolkitRoot, "package.json"));
      const {pkg: projectPkg, root: projectRoot } = getProjectPackage(toolkitRoot, toolkitPackage);
      this.projectName = projectPkg.name;
      this.projectRoot = projectRoot;
      this.projectPkg = projectPkg;

      if (debug) {
        logger.warn("Debug mode is on");
      }
    } catch (e) {
      console.error(e, "Cannot initialize project.");
      process.exit(1);
    }
  }

  /**
   * Path of the src dir.
   * @readonly
   */
  get srcDir(): string {
    return path.dirname(require!.main!.filename);
  }

  /**
   * Path of the scripts dir
   * @readonly
   */
  get scriptsDir(): string {
    return path.join(this.srcDir, "scripts");
  }

  /**
   * List of scripts available in this toolkit.
   * @readonly
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
   * Returns the given path added to path of scripts directory. A path may be given as a single string or in multiple parts.
   * @param part - Path relative to scripts dir.
   * @returns Path in config directory.
   */
  fromScriptsDir(...part: string[]) {
    return path.join(this.scriptsDir, ...part);
  }

  /**
   * Checks whether the given script exists in the scripts directory.
   * 1. If the given path is found, return it.
   * 2. If the file name has no extension, looks for a file name with the extension in order of `ts`, `js`.
   * 3. If the file name with an extension is found, return the full path of the file, including the extension.
   * @param scriptFile - Script file to check for the existance of.
   * @returns Full path of the script. Null if none is found.
   */
  hasScript(scriptFile: string): string | null {
    const scriptPath = this.fromScriptsDir(scriptFile);
    
    if (fs.existsSync(scriptPath)) {
      return scriptPath;
    }
    if (path.extname(scriptFile) === "") {
      for (const extension of ["ts", "js"]) {
        const filePath = `${scriptPath}.${extension}`;
        if (fs.existsSync(filePath)) {
          return filePath;
        }
      }
    }
    return null;
  }

  executeFromCLI(): never |  undefined | void {
    const [executor, ignoredBin, script, ...args] = process.argv;
    const command = `"${path.basename(ignoredBin)} ${`${script} ${args.join(" ")}`.trim()}"`;
    
    if (!script || !this.hasScript(script)) {
      script ? logger.error(`Script could not be found: ${script}`) : "";
    }
  }
}
