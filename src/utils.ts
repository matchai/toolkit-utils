import arrify from "arrify";

/**
 * Returns a new array, replacing an argument name with a new name. Does not mutate the original array.
 * @param args - Arguments array.
 * @param names - Parameter names to look for in arguments.
 * @param newName - Parameter names to look for in arguments.
 * @returns An array with the arguments replaced.
 * @example
 * const arguments = ["--a", "--b"];
 * replaceArgumentName(arguments, ["--a"], "--c"); // -> ["--c", "--b"]
 */
export function replaceArgumentName(args: any[], names: string | string[], newName: string): any[] {
  const newArgs = [...args];
  for (const name of arrify(names)) {
    const index = newArgs.indexOf(name);
    if (index > -1) {
      newArgs.splice(index, 1, newName);
      return newArgs;
    }
  }
  return newArgs;
}
