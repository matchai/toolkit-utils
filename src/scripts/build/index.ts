/**
 * Build project using TypeScript or Babel based on project type.
 *
 * **TypeScript**
 * * Copies js and d.ts files from src to lib using `rsync`, because `tsc` does not allow `--allowJs` and `--declaration` parameters at the same time.
 * * Cleans target directory before build.
 *
 * **Babel**
 * * If no `--ignore` parameter presents, ignores by default: `__tests__`, `__mocks__`, `__test_supplements__`, `__test_helpers__`, `*.(test|spec).(js|ts|jsx|tsx)`
 *
 * @property [--out-dir=lib]  Output destination for built files. (Babel)
 * @property [--outDir=lib]   Output destination for built files. (Typescript)
 * @property [--no-clean]     If present, does not clean target directory.
 * @property [OTHERS]         All CLI options used by related binary. (tsc or babel)
 * @example
 * $ npm run build -- --watch --preserveWatchOutput
 * $ npx auth0-toolkit build
 * $ npx auth0-toolkit build --watch --preserveWatchOutput
 */

import ScriptKit from "../../script-kit";
import { Script } from "../../@types";
import project from "../..";

export const script: Script = function script(args: Array<any>, s: ScriptKit) {
  const subScript = project.isTypeScript ? "tsc" : "babel";
  return s.executeSubScript(subScript, args);
};
