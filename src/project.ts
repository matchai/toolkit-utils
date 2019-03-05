import arrify from "arrify";
import { SpawnSyncOptions } from "child_process";
import spawn from "cross-spawn";
import fs from "fs-extra";
import _ from "lodash";
import path from "path";
import { Signale } from "signale";
import { Executable, IScriptResult } from "./@types";
import { getProjectPackage, getToolkitRoot, printHelp } from "./project-util";
import ScriptKit from "./script-kit";

export default class Project {
  /**
   * Path of the src dir in the toolkit.
   */
  get srcDir(): string {
    return this.filesDir || path.dirname(require!.main!.filename);
  }

  /**
   * Path of the scripts dir.
   */
  get scriptsDir(): string {
    return path.join(this.srcDir, "scripts");
  }

  /**
   * Path of the config dir.
   */
  get configDir(): string {
    return path.join(this.srcDir, "config");
  }

  /**
   * The name of the toolkit.
   */
  get toolkitName(): string {
    return this.toolkitPkg.name;
  }

  /**
   * Path of the root of the toolkit.
   */
  get toolkitRootDir(): string {
    return this.toolkitRoot;
  }

  /**
   * The name of the project
   */
  get name(): string {
    return this.projectPkg.name;
  }

  /**
   * The full project package.json object.
   */
  get package(): { [key: string]: any } {
    return this.projectPkg;
  }

  /**
   * Determine whether a project is compiled via Typescript or Babel.
   */
  get isCompiled(): boolean {
    return this.isTypeScript || this.packageHas(["scripts", "build"]);
  }

  /**
   * Determine whether a project is a TypeScript project.
   */
  get isTypeScript(): boolean {
    return this.packageHas("types");
  }

  /**
   * The command name of the toolkit's bin.
   */
  get toolkitBin(): string | undefined {
    const bin = this.toolkitPkg.bin;
    return typeof bin === "string"
      ? this.toolkitName
      : Object.keys(bin || {})[0];
  }

  /**
   * List of scripts available in this toolkit.
   */
  get availableScripts(): string[] {
    return fs
      .readdirSync(this.scriptsDir)
      .map(script => script.replace(/\.(js|ts)$/, ""))
      .sort();
  }

  public debug: boolean;
  public logger: Signale;
  private silent: boolean;
  private projectRoot: string;
  private projectPkg: { [key: string]: any } = {};
  private filesDir: string;
  private toolkitRoot: string;
  private toolkitPkg: { [key: string]: any } = {};

  /**
   * The utility class for viewing and manipulating project properties, as well as executing scripts.
   * @param options - Options
   * @param options.toolkitRoot - The root of the toolkit using this library.
   * @param options.filesDir - The directory of the `scripts` and `config` directories. May be the `src` or `lib` directory where the toolkit is called from.
   * @param options.debug - Enables debug logs.
   */
  constructor({
    debug = false,
    silent = false,
    logger = new Signale(),
    filesDir = path.dirname(require!.main!.filename),
    toolkitRoot = getToolkitRoot()
  }: {
    debug?: boolean;
    silent?: boolean;
    logger?: Signale;
    filesDir?: string;
    toolkitRoot?: string;
  } = {}) {
    try {
      const toolkitPkg = fs.readJSONSync(
        path.join(toolkitRoot, "package.json")
      );
      const { pkg: projectPkg, root: projectRoot } = getProjectPackage(
        toolkitRoot,
        toolkitPkg
      );
      this.debug = debug;
      this.logger = logger;
      this.silent = silent;
      this.projectRoot = projectRoot;
      this.projectPkg = projectPkg;
      this.filesDir = filesDir;
      this.toolkitRoot = toolkitRoot;
      this.toolkitPkg = toolkitPkg;

      if (debug) {
        this.logger.warn("Debug mode is on");
      }
    } catch (error) {
      throw new Error(`Cannot initialize project.\n${error}`);
    }
  }

  /**
   * Returns the given path added to the path of the project root.
   * A path may be given as a single string or in multiple parts.
   * @param part - Path relative to the root dir.
   * @returns Path in root directory.
   */
  public fromRoot(...part: string[]): string {
    return path.join(this.projectRoot, ...part);
  }

  /**
   * Returns the given path added to the path of the toolkit root.
   * A path may be given as a single string or in multiple parts.
   * @param part - Path relative to the root dir of the toolkit.
   * @returns Path in toolkit root directory.
   */
  public fromToolkitRoot(...part: string[]): string {
    return path.join(this.toolkitRootDir, ...part);
  }

  /**
   * Returns the given path added to path of the config directory.
   * A path may be given as a single string or in multiple parts.
   * @param part - Path relative to the config dir.
   * @returns Path in config directory.
   */
  public fromConfigDir(...part: string[]) {
    return path.join(this.configDir, ...part);
  }

  /**
   * Returns the given path added to path of the scripts directory.
   * A path may be given as a single string or in multiple parts.
   * @param part - Path relative to the scripts dir.
   * @returns Path in scripts dir.
   */
  public fromScriptsDir(...part: string[]) {
    return path.join(this.scriptsDir, ...part);
  }

  /**
   * Returns one of the given values based on whether project has any of the given dependencies in `dependencies`, `devDependencies`, `peerDependencies`.
   * @param deps - Dependency or dependencies to check.
   * @returns Boolean value based on the existence of dependency in package.json.
   */
  public hasAnyDep(deps: string[] | string): boolean {
    const depsList = typeof deps === "string" ? [deps] : deps;
    return depsList.some(dep => {
      return (
        this.packageHas(["dependencies", dep]) ||
        this.packageHas(["devDependencies", dep]) ||
        this.packageHas(["peerDependencies", dep])
      );
    });
  }

  /**
   * Checks whether the given environment variable is set.
   * @param name - Name of the environment variable to look for.
   * @returns Whether the given environment variable is set.
   */
  public envIsSet(name: string): boolean {
    return (
      process.env.hasOwnProperty(name) &&
      process.env[name] !== "" &&
      process.env[name] !== "undefined"
    );
  }

  /**
   * Returns environment variable if it is set. Returns the default value otherwise.
   * @param name - Name of the environment variable to look for.
   * @param defaultValue - Default value if the environment variable is not net.
   * @returns Environment variable or default value
   */
  public parseEnv<T>(
    name: string,
    defaultValue?: T
  ): string | number | object | T | undefined {
    if (this.envIsSet(name)) {
      const result = process.env[name] as string;
      try {
        return JSON.parse(result);
      } catch {
        return result;
      }
    }
    return defaultValue;
  }

  /**
   * Checks if a given path is a direct property of the `package.json`
   * @param jsonPath - The path to check
   * @returns Whether the given path is in the package file
   */
  public packageHas(jsonPath: string | string[]): boolean {
    return _.has(this.package, jsonPath);
  }

  /**
   * Provides the value at the given path within `package.json`
   * @param jsonPath - The path to get a value from
   * @returns The value at the given path in the package file
   */
  public packageGet(jsonPath: string | string[]): any {
    return _.get(this.package, jsonPath);
  }

  /**
   * Sets the value at the given path within `package.json`
   * @param jsonPath - The path to get a value from
   * @param value - The value to set at the path
   */
  public packageSet(jsonPath: string | string[], value: any): void {
    _.set(this.projectPkg, jsonPath, value);
    this.writeFile("package.json", this.package);
  }

  /**
   * Checks whether the given script exists in the scripts directory.
   * 1. If the given path is found, return it.
   * 2. If the file name has no extension, looks for a file name with the extension in order of `ts`, `js`.
   * 3. If the file name with an extension is found, return the full path of the file, including the extension.
   * @param scriptFile - Script file to check for the existance of.
   * @returns Full path of the script. Null if none is found.
   */
  public hasScript(scriptFile: string): string | null {
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
   * @param fileNames - The filename(s) including the extension to look for in the project root.
   */
  public hasAnyFile(fileNames: string[] | string): boolean {
    const fileNameList =
      typeof fileNames === "string" ? [fileNames] : fileNames;
    return fileNameList.some(fileName => {
      const filePath = path.join(this.projectRoot, fileName);
      return fs.existsSync(filePath) ? true : false;
    });
  }

  /**
   * Creates and writes the given data to a file in the project.
   * @param fileName - The name of the file to be written
   * @param data - The data to be written to the file. Objects that are provided will be serialized.
   */
  public writeFile(fileName: string, data: string | { [key: string]: any }) {
    if (data === null || data === undefined) {
      throw new Error(
        "Cannot write file. File data cannot be null or undefined."
      );
    }

    const filePath = this.fromRoot(fileName);
    try {
      const content =
        typeof data === "object" ? JSON.stringify(data, undefined, 2) : data;
      fs.outputFileSync(filePath, `${content}\n`);

      this.logger.info(`File written: ${filePath}`);
    } catch (error) {
      throw new Error(`Cannot create file: ${filePath}\n${error}`);
    }
  }

  /**
   * Copies a file from the toolkit to the project.
   * Paths should be given relative to the toolkit root and project root.
   * @param sourceFile - The path to the source file.
   * @param newFile - The path to the destination file.
   */
  public copyFile(sourceFile: string, newFile: string) {
    const sourcePath = this.fromToolkitRoot(sourceFile);
    const destinationPath = this.fromRoot(newFile);

    try {
      fs.copySync(sourcePath, destinationPath);
      this.logger.info(`Copied file: ${sourcePath} to ${destinationPath}`);
    } catch (error) {
      throw new Error(
        `Cannot copy file: ${sourcePath} to ${destinationPath}\n${error}`
      );
    }
  }

  /**
   * Returns the relative path to an executable located in `node_modules/.bin`.
   * @param executable - The name of the executable.
   */
  public bin(executable: string): string {
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
  public getConcurrentlyArgs(
    scripts: { [key: string]: Executable | null | undefined },
    { killOthers = true } = {}
  ): string[] {
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

    const fullScripts = _.pickBy(scripts) as { [key: string]: Executable }; // Clear empty keys
    const prefixColors = Object.keys(fullScripts)
      .reduce(
        (pColors, s, i) =>
          pColors.concat([`${colors[i % colors.length]}.bold.reset`]),
        [] as string[]
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
  public executeScriptFile(
    scriptFile: string,
    args: string[] = []
  ): IScriptResult | IScriptResult[] {
    const file = this.fromScriptsDir(scriptFile);
    const { script: scriptFunction } = require(file);
    if (typeof scriptFunction !== "function") {
      throw new Error(`"${scriptFile}" does not export a \"script\" function.`);
    }

    return scriptFunction(this, args, new ScriptKit(this, scriptFile));
  }

  /**
   * Executes a script based on the script name that was passed in `process.argv`.
   * @param exit - Whether to exit from process.
   * @returns Result of script
   */
  public executeFromCLI({ exit = true }: { exit?: boolean } = {}):
    | void
    | IScriptResult
    | IScriptResult[] {
    const [executor, ignoredBin, script, ...args] = process.argv;
    const command = `"${path.basename(ignoredBin)} ${`${script} ${args.join(
      " "
    )}`.trim()}"`;
    let shouldExit = exit;

    if (!script || !this.hasScript(script)) {
      if (script) this.logger.error(`Script could not be found: ${script}`);
      printHelp(this.availableScripts);
      return shouldExit ? process.exit(1) : undefined;
    }

    try {
      let success = true;
      let emitGeneralError = false;
      const results = this.executeScriptFile(script, args);
      const consoleErrorMessages: Error[] = [];

      arrify(results).forEach((result: IScriptResult) => {
        success = result.status === 0 && success;
        shouldExit =
          shouldExit && (result.exit === undefined ? true : result.exit);
        // Log as necessary
        if (result.error instanceof Error) {
          this.logger.error(result.error.message); // JS Error in result
          consoleErrorMessages.push(result.error);
        } else if (result.error) {
          this.logger.error(result.error); // Standard error in result
        } else if (result.status !== 0) {
          emitGeneralError = true;
        }
      });

      if (emitGeneralError) {
        this.logger.error(
          `${script} finished with error in command: ${command}`
        ); // Fail without error message
      }

      // Throw full Error objects
      consoleErrorMessages.forEach(this.logger.error);
      return shouldExit ? process.exit(success ? 0 : 1) : results;
    } catch (error) {
      throw new Error(`Cannot finish the execution of ${command}\n${error}`);
    }
  }

  /**
   * Executes a binary using `spawn.sync` with given arguments and returns results.
   * For a single {@link Executable}, it executes and returns result. For multiple {@link Executable Executables}, it executes them
   * serially. Execution stops and the function returns result, if one of the commands fails (which adds previous results to `result.previousResults`).
   * If an object is provided with names as keys and {@link Executable Executables} as values, it executes them using `concurrently`
   * and returns result of `concurrently`.
   * @param   {...Executable} executables - Executable or executables.
   * @returns {IScriptResult}              - Result of the executable.
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
  public execute(
    ...executables: Array<
      Executable | { [key: string]: Executable | undefined } | undefined
    >
  ): IScriptResult {
    if (executables.length === 0) return { status: 0 };

    if (executables.length > 1) {
      const results: IScriptResult[] = [];
      // tslint:disable-next-line: no-shadowed-variable
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
    let options: SpawnSyncOptions = {
      stdio: this.silent ? "ignore" : "inherit"
    };

    if (Array.isArray(executable)) {
      [exe, args] = executable;
      options = (executable[2] as SpawnSyncOptions) || options;
    } else if (typeof executable === "object") {
      const truthyValues = Object.values(executable).filter(Boolean);
      if (truthyValues.length === 0) return { status: 0 };
      exe = this.bin("concurrently");
      args = this.getConcurrentlyArgs(executable);
    }

    if (this.debug) {
      this.logger.debug(
        new Error().stack!.replace(/^Error/, `Stack trace for ${exe}`)
      );
    }

    return spawn.sync(exe, args, options);
  }
}
