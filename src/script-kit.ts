import fs from "fs";
import path from "path";
import { IScriptResult } from "./@types";
import Project from "./project";

export default class ScriptKit {
  private scriptFile: string;
  private project: Project;

  constructor(project: Project, scriptFile: string) {
    const file = project.hasScript(scriptFile);
    if (!file) {
      throw new Error(
        `Script "${scriptFile}" cannot be found in "${project.scriptsDir}"`
      );
    }
    this.project = project;
    this.scriptFile = fs.statSync(file).isDirectory()
      ? require.resolve(file)
      : file;
  }

  /**
   * The directory of the script.
   */
  get dir(): string {
    return path.dirname(this.scriptFile);
  }

  /**
   * The config directory of the script. It is determined relative to the script directory.
   * This allows for the config directory to be determined for source and transpiled files.
   */
  get configDir(): string {
    const dirs = path.dirname(this.scriptFile).split(path.sep);
    while (dirs.length > 0 && dirs.pop() !== "scripts") {}
    dirs.push("config");
    return dirs.join(path.sep);
  }

  /**
   * File extension of the script without the "."
   * @example
   * const ext = s.extension(); // js
   */
  get extension(): string {
    return path.extname(this.scriptFile).replace(/\./, "");
  }

  /**
   * Returns the absolute of a file or dir given a path relative to the script path.
   * Can be provided in multiple parts.
   * @param part - Path relative to the base path
   * @example
   * const absPath = here("a.txt"); // /some/path/mydir/a.txt
   */
  public here(...part: string[]): string {
    return path.join(this.dir, ...part);
  }

  /**
   * Returns the absolute dir of a file or dir given a path relative to the script path.
   * Can be provided in multiple parts.
   * @param part - Path relative to the base path
   * @example
   * const absPath = here("a.txt"); // /some/path/mydir/a.txt
   */
  public hereRelative(...part: string[]): string {
    return `.${path.sep}${path.relative(
      process.cwd(),
      path.join(this.dir, ...part)
    )}`;
  }

  /**
   * Executes sub-scripts in the script directory. For example, a `build` script may have `tsc.js` and `babel.js`.
   * You would call `project.executeScriptFile("build")`. In that script file, a sub-script may be called.
   * @param name - The name of the sub-script to be executed
   * @param args - The arguments to be passed to the sub-script
   * @example
   * // The 'build' dir has the following files: 'index.js', 'tsc.js', 'babel.js'.
   * // In a file:
   * project.executeScriptFileSync("build"); // Executes build/index.js
   * // In build/index.js:
   * scriptKit.executeSubScript("tsc", args); // Executes build/tsc.js
   */
  public executeSubScript(
    name: string,
    args: string[]
  ): IScriptResult | IScriptResult[] {
    const scriptFile = path.join(
      path.relative(this.project.scriptsDir, this.dir),
      name
    );
    return this.project.executeScriptFile(scriptFile, args);
  }
}
