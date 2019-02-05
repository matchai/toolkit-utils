import yargsParser from 'yargs-parser';
import ScriptKit from '../script-kit';
import {Script} from '../@types';
import project from '../';

/**
 * Formats project files using `prettier`.
 * 
 * * If no config is provided (`--config`, `prettier.config.js`, or `prettierrc` in package.json), the default Prettier configuration will be used.
 * * If no `--ignore-path` flag is provided or no `.prettierignore` file is present, the ignore file provided by the library will be used.
 * 
 * @property [--no-write] If provided, files will not be written to disk. (Defaults to writing to disk)
 * @property [OTHERS]     All CLI options provided used by the `prettier` binary.
 * @example
 * $ npm run format
 * $ npx auth0-scripts format
 */
export const script: Script = function script(args: Array<string>, s: ScriptKit) {
  const parsedArgs = yargsParser(args);
  const useBuiltinConfig = 
    !args.includes("--config") &&
    !project.hasFile(".prettierrc") &&
    !project.hasFile("prettier.config.js") &&
    !project.package.hasOwnProperty("prettierrc");
}
