import path from "path";
import fs from "fs-extra";
import globby from "globby";
import logger from "signale";
import spawn from "cross-spawn";
import { pickBy } from "lodash";
import ScriptKit from "./script-kit";
import {
  getToolkitRoot,
  getProjectPackage,
  printHelp
} from "./helpers/project-util";
import { ScriptResult, Executable } from "./@types";
import { SpawnSyncOptions } from "child_process";

export default class Project {
  projectName: string;
  projectRoot: string;
  projectPkg: { [key: string]: any };
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
    try {
      const toolkitPackage = fs.readJSONSync(
        path.join(toolkitRoot, "package.json")
      );
      const { pkg: projectPkg, root: projectRoot } = getProjectPackage(
        toolkitRoot,
        toolkitPackage
      );
      this.projectName = projectPkg.name;
      this.projectRoot = projectRoot;
      this.projectPkg = projectPkg;
      this.debug = debug;

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
    const relative = path.relative(
      process.cwd(),
      this.fromRoot(`node_modules/.bin/${executable}`)
    );
    return `.${path.sep}${relative}`;
  }

  /**
   * Given an object with keys as script names and values as commands, return parameters to pass concurrently.
   * @param scripts - Object with script names as keys and commands as values.
   * @param killOthers - Whether all scripts should be killed if one fails.
   * @returns - Arguments to use with concurrently
   */
  getConcurrentlyArgs(
    scripts: { [key: string]: Executable | null | undefined },
    { killOthers = true } = {}
  ): Array<string> {
    const colors = [
      "bgBlue",
      "bgGreen",
      "bgMagenta",
      "bgCyan",
      "bgWhite",
      "bgRed",
      "bgBlack",
      "bgYellow"
    ];

    const fullScripts = pickBy(scripts) as { [key: string]: Executable }; // Clear empty keys
    const prefixColors = Object.keys(fullScripts)
      .reduce(
        (pColors, _s, i) =>
          pColors.concat([`${colors[i % colors.length]}.bold.reset}`]),
        [] as Array<string>
      )
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
  executeScriptFile(
    scriptFile: string,
    args: Array<string> = []
  ): ScriptResult | Array<ScriptResult> {
    debugger;
    const file = this.fromScriptsDir(scriptFile);
    const { script: scriptFunction } = require(file);
    if (typeof scriptFunction !== "function") {
      logger.error(
        new Error(`${scriptFile} does not export a \"script\" function.`)
      );
      process.exit(1);
    }

    return scriptFunction(args, new ScriptKit(scriptFile));
  }

  /**
   * Executes a script based on the script name that was passed in `process.argv`.
   * @param exit - TODO: Get back to this
   */
  executeFromCLI({ exit = true } = {}):
    | never
    | ScriptResult
    | Array<ScriptResult>
    | undefined {
    const [executor, ignoredBin, script, ...args] = process.argv;
    const command = `"${path.basename(ignoredBin)} ${`${script} ${args.join(
      " "
    )}`.trim()}"`;
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
    } catch (e) {}
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
   *     builder: ["tsc", ["arg"],
   *   },
   *   ["other-serial-command", ["arg"]],
   * );
   */
  execute(
    ...executables: Array<
      | Executable
      | { [key: string]: Executable | null | undefined }
      | null
      | undefined
    >
  ): ScriptResult {
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
      logger.debug(
        new Error().stack!.replace(/^Error/, `Stack trace for ${exe}`)
      );
    }

    return spawn.sync(exe, args, options);
  }
}
