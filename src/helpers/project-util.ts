import path from "path";
import readPkgUp from "read-pkg-up";

/**
 * Returns this toolkit's package.json path and data.
 * @returns Toolkit's package.json path and data.
 * @private
 */
export function getToolkitRoot(): string {
  return path.dirname(readPkgUp.sync({ cwd: __dirname }).path);
}

/**
 * Returns the root path and package.json data of the project. If the project and this module are the same, return this module's path and data.
 * @param toolkitRoot - Toolkit's root path.
 * @param toolkitPkg - Toolkit's package.json data.
 * @returns Consuming project's package.json path and data.
 * @private
 */
export function getProjectPackage(toolkitRoot: string, toolkitPkg: { [key: string]: any }): { root: string; pkg: { [key: string]: any } } {
  // Search for the package.json outside of the module
  const { pkg, path: pkgPath } = readPkgUp.sync({ cwd: path.join(toolkitRoot, "..") });
  if (!pkgPath) {
    const { pkg: currentPkg, path: currentPath } = readPkgUp.sync({ cwd: path.join(toolkitRoot) });

    if (!currentPkg.name || currentPkg.name !== toolkitPkg.name) {
      throw new Error("Cannot find project root");
    }
  }

  return {root: pkgPath ? path.dirname(pkgPath) : toolkitRoot, pkg: pkg || toolkitPkg}
}
