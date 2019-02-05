import Project from '../project';
import ScriptKit from '../script-kit';

/**
 * Type for a script function.
 * @typedef {Function} Script
 * @param project - The project instance.
 * @param args - The list of arguments to be passed to the underlying command.
 * @param scriptKit - A {@link ScriptKit} instance, which has utility methods for the currently executing script file.
 */
export type Script = (args: Array<string>, scriptKit: ScriptKit) => ScriptResult | Array<ScriptResult>;

/**
 * Type for the returned value of a CLI command.
 */
export type ScriptResult = {
  status: number; 
  error?: Error; 
  previousResults?: Array<ScriptResult>; 
  exit?: boolean 
};
