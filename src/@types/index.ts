import { SpawnSyncOptions } from "child_process";
import Project from "../project";
import ScriptKit from "../script-kit";

/**
 * Type for a script function.
 * @param project - The project instance.
 * @param args - The list of arguments to be passed to the underlying command.
 * @param scriptKit - A {@link ScriptKit} instance, which has utility methods for the currently executing script file.
 */
export type Script = (
  project: Project,
  args: string[],
  scriptKit: ScriptKit
) => ScriptResult | ScriptResult[];

/**
 * Type for the returned value of a CLI command.
 */
export interface ScriptResult {
  status: number;
  error?: Error;
  previousResults?: ScriptResult[];
  exit?: boolean;
}

/**
 * Type for holding executables. It may be a string to store an executable name without arguments. For executables
 * with arguments or options, it is a tuple: `[bin-name, [arg1, arg2, arg3], spawn-options]`
 * @example
 * const bin = "tsc";
 * const binWithArgs = ["tsc", ["--strict", "--target", "ESNext"]];
 * const binWithOptions = ["tsc", ["--strict", "--target", "ESNext"], { encoding: "utf-8" }];
 */
export type Executable =
  | string
  | [string, string[]]
  | [string, string[], SpawnSyncOptions];
