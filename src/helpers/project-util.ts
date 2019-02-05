import path from "path";
import readPkgUp from "read-pkg-up";

/**
 * Returns a module's package.json path and data.
 * @returns {{ path: string, pkg: Object }} - Module's package.json path and data.
 * @private
 */
export function getModuleRoot(): string {
  return path.dirname(readPkgUp.sync({ cwd: __dirname }).path);
}
