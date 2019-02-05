import path from 'path';
import fs from 'fs-extra';
import globby from 'globby';
import logger from 'signale';
import ScriptKit from './script-kit';
import { getToolkitRoot, getProjectPackage, printHelp } from './helpers/project-util';
import { ScriptResult } from './@types';

export default class Project {
  projectName: string;
  projectRoot: string;
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
   * The full project package.json object
   * @readonly
   */
  get package(): { [key: string]: any } {
    return this.projectPkg;
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

  /**
   * Checks for a file with a matching filename in the project root.
   * @param fileName - The filename including the extension to look for in the project root.
   */
  hasFile(fileName: string): boolean {
    const filePath = path.join(this.projectRoot, fileName);
    return fs.existsSync(filePath) ? true : false;
  }

  /**
   * Executes a given script file's exported `script` function. The given script file should be in the "scripts" directory.
   * @param scriptFile - The script file to execute from the "scripts" directory.
   * @param args - A list of arguments to be passed to the script function.
   */
  executeScriptFile(scriptFile: string, args: Array<string> = []): ScriptResult | Array<ScriptResult> {
    const file = this.fromScriptsDir(scriptFile);
    const { script: scriptFunction } = require(file);
    if (typeof scriptFunction !== "function") {
      logger.error(new Error(`${scriptFile} does not export a \"script\" function.`));
      process.exit(1);
    }

    return scriptFunction(this, args, new ScriptKit(scriptFile));
  }

  /**
   * Executes a script based on the script name that was passed in `process.argv`.
   * @param exit - TODO: Get back to this
   */
  executeFromCLI({ exit = true} = {}): never | ScriptResult | Array<ScriptResult> | undefined {
    const [executor, ignoredBin, script, ...args] = process.argv;
    const command = `"${path.basename(ignoredBin)} ${`${script} ${args.join(" ")}`.trim()}"`;
    let shouldExit = exit;
    
    if (!script || !this.hasScript(script)) {
      script ? logger.error(`Script could not be found: ${script}`) : "";
      printHelp(this.availableScripts);
      return shouldExit ? process.exit(1) : undefined;
    }

    try {
      let success = true;
      const results = this.executeScriptFile(script, args);
      // TODO: Continue from here
    } catch (e) {

    }
  }
}
