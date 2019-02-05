import Project from "../project";
import ScriptKit from "../script-kit";
import { SpawnSyncOptions } from "child_process";

/**
 * Type for a script function.
 * @typedef {Function} Script
 * @param project - The project instance.
 * @param args - The list of arguments to be passed to the underlying command.
 * @param scriptKit - A {@link ScriptKit} instance, which has utility methods for the currently executing script file.
 */
export type Script = (
  args: Array<string>,
  scriptKit: ScriptKit
) => ScriptResult | Array<ScriptResult>;

/**
 * Type for the returned value of a CLI command.
 */
export type ScriptResult = {
  status: number;
  error?: Error;
  previousResults?: Array<ScriptResult>;
  exit?: boolean;
};

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
  | [string, Array<string>]
  | [string, Array<string>, SpawnSyncOptions];
