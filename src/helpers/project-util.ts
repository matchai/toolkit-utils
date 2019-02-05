import path from "path";
import logger from "signale";
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
export function getProjectPackage(
  toolkitRoot: string,
  toolkitPkg: { [key: string]: any }
): { root: string; pkg: { [key: string]: any } } {
  // Search for the package.json outside of the toolkit
  const { pkg, path: pkgPath } = readPkgUp.sync({
    cwd: path.join(toolkitRoot, "..")
  });
  if (!pkgPath) {
    const { pkg: currentPkg, path: currentPath } = readPkgUp.sync({
      cwd: path.join(toolkitRoot)
    });

    if (!currentPkg.name || currentPkg.name !== toolkitPkg.name) {
      logger.error(new Error("Cannot find project root"));
      process.exit(1);
    }
  }

  return {
    root: pkgPath ? path.dirname(pkgPath) : toolkitRoot,
    pkg: pkg || toolkitPkg
  };
}

/**
 * Prints the help message including the list of available scripts.
 * @param scriptNames - The list of available scripts.
 */
export function printHelp(scriptNames: Array<string>) {
  const [executor, ignoredBin, script, ...args] = process.argv;

  const scriptList = scriptNames.join("\n  ");
  let message = `Usage: ${path.basename(
    ignoredBin
  )} [script] [--flags/options]\n\n`;
  message += `Available scripts:\n ${scriptList}\n\n`;
  message += `Options:\n`;
  message += `  All flags and options that are passed to auth0-toolkit will be forwarded to the tool that is running under the hood.`;
  console.log(`\n${message.trim()}\n`);
}
