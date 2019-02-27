import path from "path";
import readPkgUp from "read-pkg-up";
import logger from "signale";

/**
 * Returns callsites from the V8 stack trace API
 * @returns The top-most callsite
 * @private
 */
function getStackTrace(): any[] {
  const old = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stackTrace) => stackTrace;
  const stack = (new Error().stack as any) as any[];
  Error.prepareStackTrace = old;
  /* istanbul ignore next */
  if (!stack) {
    throw new Error(
      "No stack trace available. Probably this is top most module."
    );
  }
  return stack.slice(1);
}

/**
 * Returns this toolkit's package.json path and data.
 * @returns Toolkit's package.json path and data.
 * @private
 */
export function getToolkitRoot(): string {
  const root = path.dirname(
    readPkgUp.sync({ cwd: __dirname, normalize: false }).path
  );

  // Find the toolkit by finding the file which creates the Project instance outside of toolkit-utils
  const targetStack = getStackTrace().find(
    e =>
      e.getFileName() &&
      !e.getFileName().startsWith("internal") &&
      !path.dirname(e.getFileName()).startsWith(root)
  );

  if (!targetStack) {
    throw new Error("Cannot get module root.");
  } else {
    return path.dirname(
      readPkgUp.sync({ cwd: targetStack.getFileName(), normalize: false }).path
    );
  }
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
    cwd: path.join(toolkitRoot, ".."),
    normalize: false
  });
  if (!pkgPath) {
    const { pkg: currentPkg, path: currentPath } = readPkgUp.sync({
      cwd: path.join(toolkitRoot),
      normalize: false
    });

    if (!currentPkg.name || currentPkg.name !== toolkitPkg.name) {
      logger.error(new Error("Cannot find project root"));
      process.exit(1);
    }
  }

  return {
    pkg: pkg || toolkitPkg,
    root: pkgPath ? path.dirname(pkgPath) : toolkitRoot
  };
}

/**
 * Prints the help message including the list of available scripts.
 * @param scriptNames - The list of available scripts.
 */
export function printHelp(scriptNames: string[]) {
  const [executor, ignoredBin, script, ...args] = process.argv;

  const scriptList = scriptNames.join("\n  ");
  let message = `Usage: ${path.basename(
    ignoredBin
  )} [script] [--flags/options]\n\n`;
  message += `Available scripts:\n  ${scriptList}\n\n`;
  message += `Options:\n`;
  message += `  All flags and options that are passed to auth0-toolkit will be forwarded to the tool that is running under the hood.`;
  console.log(`\n${message.trim()}\n`); // tslint:disable-line: no-console
}
