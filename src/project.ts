import path from "path";
import fs from "fs-extra";
import globby from "globby";
import logger from "signale";
import spawn from "cross-spawn";
import arrify from "arrify";
import _ from "lodash";
import ScriptKit from "./script-kit";
import { getToolkitRoot, getProjectPackage, printHelp } from "./helpers/project-util";
import { ScriptResult, Executable } from "./@types";
import { SpawnSyncOptions } from "child_process";

export default class Project {
  private projectName: string;
  private projectRoot: string;
  private projectPkg: { [key: string]: any } = {};
  debug: boolean;

  constructor({
    toolkitRoot = getToolkitRoot(),
    cwd,
    debug = false
  }: {
    toolkitRoot?: string;
    cwd?: string;
    debug?: boolean;
  } = {}) {
    this.debug = debug;

    try {
      const toolkitPackage = fs.readJSONSync(path.join(toolkitRoot, "package.json"));
      const { pkg: projectPkg, root: projectRoot } = getProjectPackage(toolkitRoot, toolkitPackage);
      this.projectName = projectPkg.name;
      this.projectRoot = projectRoot;
      this.projectPkg = projectPkg;

      if (debug) {
        logger.warn("Debug mode is on");
      }
    } catch (e) {
      throw new Error(e + "\nCannot initialize project.");
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
   * Path of the config dir
   * @readonly
   */
  get configDir(): string {
    return path.join(this.srcDir, "config");
  }

  /**
   * The full project package.json object
   * @readonly
   */
  get package(): { [key: string]: any } {
    return this.projectPkg;
  }

  /**
   * Determine whether a project is a TypeScript project.
   * @readonly
   */
  get isTypeScript(): boolean {
    return this.package.hasOwnProperty("types");
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
   * Returns the given path added to the path of the project root.
   * A path may be given as a single string or in multiple parts.
   * @param part - Path relative to the root dir.
   * @returns Path in root directory.
   */
  fromRoot(...part: Array<string>): string {
    return path.join(this.projectRoot, ...part);
  }

  /**
   * Returns the given path added to path of the config directory.
   * A path may be given as a single string or in multiple parts.
   * @param part - Path relative to the config dir.
   * @returns Path in config directory.
   */
  fromConfigDir(...part: string[]) {
    return path.join(this.configDir, ...part);
  }

  /**
   * Returns the given path added to path of the scripts directory.
   * A path may be given as a single string or in multiple parts.
   * @param part - Path relative to the scripts dir.
   * @returns Path in scripts dir.
   */
  fromScriptsDir(...part: string[]) {
    return path.join(this.scriptsDir, ...part);
  }

  /**
   * Returns one of the given values based on whether project has any of the given dependencies in `dependencies`, `devDependencies`, `peerDependencies`.
   * @param deps - Dependency or dependencies to check.
   * @returns Boolean value based on the existence of dependency in package.json.
   */
  hasAnyDep(deps: string[] | string): boolean {
    if (typeof deps === "string") deps = [deps];
    return deps.some(dep => {
      return (
        _.has(this.package, ["dependencies", dep]) ||
        _.has(this.package, ["devDependencies", dep]) ||
        _.has(this.package, ["peerDependencies", dep])
      );
    });
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
   * Returns the relative path to an executable located in `node_modules/.bin`.
   * @param executable - The name of the executable.
   */
  bin(executable: string): string {
    const relative = path.relative(process.cwd(), this.fromRoot(`node_modules/.bin/${executable}`));
    return `.${path.sep}${relative}`;
  }

  /**
   * Given an object with keys as script names and values as commands, return parameters to pass concurrently.
   * @param scripts - Object with script names as keys and commands as values.
   * @param killOthers - Whether all scripts should be killed if one fails.
   * @returns - Arguments to use with concurrently
   */
  getConcurrentlyArgs(scripts: { [key: string]: Executable | null | undefined }, { killOthers = true } = {}): Array<string> {
    const colors = ["bgBlue", "bgGreen", "bgMagenta", "bgCyan", "bgWhite", "bgRed", "bgBlack", "bgYellow"];

    const fullScripts = _.pickBy(scripts) as { [key: string]: Executable }; // Clear empty keys
    const prefixColors = Object.keys(fullScripts)
      .reduce((pColors, _s, i) => pColors.concat([`${colors[i % colors.length]}.bold.reset}`]), [] as Array<string>)
      .join(",");

    // prettier-ignore
    return [
      killOthers ? "--kill-others-on-fail" : "",
      "--prefix", "[{name}]",
      "--names", Object.keys(fullScripts).join(","),
      "--prefix-colors", prefixColors,
      ...Object.values(fullScripts).map(s => JSON.stringify(typeof s === "string" ? s : `${s[0]} ${s[1].join(" ")}`))
    ].filter(Boolean);
  }

  /**
   * Executes a given script file's exported `script` function. The given script file should be in the "scripts" directory.
   * @param scriptFile - The script file to execute from the "scripts" directory.
   * @param args - A list of arguments to be passed to the script function.
   */
  executeScriptFile(scriptFile: string, args: Array<string> = []): ScriptResult | Array<ScriptResult> {
    debugger;
    const file = this.fromScriptsDir(scriptFile);
    const { script: scriptFunction } = require(file);
    if (typeof scriptFunction !== "function") {
      logger.error(new Error(`${scriptFile} does not export a \"script\" function.`));
      process.exit(1);
    }

    return scriptFunction(args, new ScriptKit(scriptFile));
  }

  /**
   * Executes a script based on the script name that was passed in `process.argv`.
   */
  executeFromCLI(): never {
    const [executor, ignoredBin, script, ...args] = process.argv;
    const command = `"${path.basename(ignoredBin)} ${`${script} ${args.join(" ")}`.trim()}"`;

    if (!script || !this.hasScript(script)) {
      script ? logger.error(`Script could not be found: ${script}`) : "";
      printHelp(this.availableScripts);
    }

    try {
      let success = true;
      let emitGeneralError = false;
      const results = this.executeScriptFile(script, args);
      const consoleErrorMessages: Error[] = [];

      arrify(results).forEach((result: ScriptResult) => {
        success = result.status === 0 && success;
        // Log as necessary
        if (result.error instanceof Error) {
          logger.error(result.error.message); // JS Error in result
          consoleErrorMessages.push(result.error);
        } else if (result.error) {
          logger.error(result.error); // Standard error in result
        } else if (result.status !== 0) {
          emitGeneralError = true;
        }
      });

      if (emitGeneralError) {
        logger.error(`${script} finished with error in command: ${command}`); // Fail without error message
      }

      // Throw full Error objects
      consoleErrorMessages.forEach(console.error);
      return process.exit(success ? 0 : 1);
    } catch (e) {
      const error = new Error(`${e}\nCannot finish execution of ${command}`);
      logger.error(error.message);
      throw error;
    }
  }

  /**
   * Executes a binary using `spawn.sync` with given arguments and returns results.
   * For a single {@link Executable}, it executes and returns result. For multiple {@link Executable Executables}, it executes them
   * serially. Execution stops and the function returns result, if one of the commands fails (which adds previous results to `result.previousResults`).
   * If an object is provided with names as keys and {@link Executable Executables} as values, it executes them using `concurrently`
   * and returns result of `concurrently`.
   * @param   {...Executable} executables - Executable or executables.
   * @returns {ScriptResult}              - Result of the executable.
   * @example
   * // Execute some commands serially and concurrently. Commands in the object are executed concurrently.
   * // 1. `serial-command-1` is executed first.
   * // 2. `serial-command-2` is executed second.
   * // 3. Based on a condition, `serial-command-3` might be executed.
   * // 4. `build doc command`, `some-other-command`, and `tsc` are executed in parallel. (object keys are names used in logs)
   * // 5. Lastly, `other-serial-command` is executed.
   * const result = project.execute(
   *   ["serial-command-1", ["arg"]],
   *   "serial-command-2",
   *   someCondition ? "serial-command-3" : null,
   *   {
   *     my-parallel-job: ["build-doc-command", ["arg"],
   *     my-parallel-task: "some-other-command"
   *     builder: ["tsc", ["arg"]],
   *   },
   *   ["other-serial-command", ["arg"]],
   * );
   */
  execute(...executables: Array<Executable | { [key: string]: Executable | undefined } | undefined>): ScriptResult {
    if (executables.length === 0) return { status: 0 };

    if (executables.length > 1) {
      const results: ScriptResult[] = [];
      for (const executable of executables.filter(Boolean)) {
        const result = this.execute(executable);
        if (result.status !== 0) {
          result.previousResults = results;
          return result;
        }
        results.push(result);
      }
      return { status: 0, previousResults: results };
    }

    const executable = executables[0];
    let exe = typeof executable === "string" ? executable : "";
    let args;
    let options: SpawnSyncOptions = { stdio: "inherit" };

    if (Array.isArray(executable)) {
      [exe, args] = executable;
      options = (executable[2] as SpawnSyncOptions) || options;
    } else if (typeof executable === "object") {
      exe = this.bin("concurrently");
      args = this.getConcurrentlyArgs(executable);
    }

    if (this.debug) {
      logger.debug(new Error().stack!.replace(/^Error/, `Stack trace for ${exe}`));
    }

    return spawn.sync(exe, args, options);
  }
}
