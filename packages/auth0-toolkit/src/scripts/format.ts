import { Project, ScriptKit, Script } from 'toolkit-utils';
import yargsParser from "yargs-parser";
import project from "../";

/**
 * Formats project files using `prettier`.
 *
 * * If no config is provided (`--config`, `prettier.config.js`, or `prettierrc` in package.json), the default Prettier configuration will be used.
 * * If no `--ignore-path` flag is provided or no `.prettierignore` file is present, the ignore file provided by the library will be used.
 *
 * @property [--no-write]  If provided, files will not be written to disk. (Defaults to writing to disk)
 * @property [OTHERS]      All CLI options provided used by the `prettier` binary.
 * @example
 * $ npm run format
 * $ npx auth0-scripts format
 */
export const script: Script = function script(project: Project, args: Array<string>, s: ScriptKit) {
  const parsedArgs = yargsParser(args);
  const prettierConfigFiles = [
    ".prettierrc",
    ".prettierrc.yaml",
    ".prettierrc.yml",
    ".prettierrc.json",
    ".prettierrc.js",
    ".prettierrc.toml",
    "prettier.config.js"
  ];
  const useBuiltinConfig =
    !args.includes("--config") && !project.hasAnyFile(prettierConfigFiles) && !project.package.hasOwnProperty("prettier");

  const config = useBuiltinConfig ? ["--config", project.fromConfigDir(`.prettierrc.js`)] : [];

  const useBuiltinIgnore = !args.includes("--ignore-path") && !project.hasAnyFile(".prettierignore");
  const ignore = useBuiltinIgnore ? ["--ignore-path", project.fromConfigDir(".prettierignore")] : [];

  const write = args.includes("--no-write") ? [] : ["--write"];

  // Convert absolute paths provided by the pre-commit hook into relative paths.
  // This ensures that the paths are treated as globs, so prettierignore will be applied.
  const relativeArgs = args.map(a => a.replace(`${process.cwd()}/`, ""));
  const filesToApply = parsedArgs._.length ? [] : ["**/*.+(js|jsx|json|less|css|ts|tsx|md)"];
  return project.execute(["prettier", [...config, ...ignore, ...write, ...filesToApply].concat(relativeArgs)]);
};
