import { Project, ScriptKit, Script } from 'toolkit-utils';
import isCI from "is-ci";

process.env.BABEL_ENV = "test";
process.env.NODE_ENV = "test";

export const script: Script = function script(project: Project, args: Array<string>, s: ScriptKit) {
  const watch =
    !isCI &&
    !args.includes("--no-watch") &&
    !args.includes("--coverage") &&
    !args.includes("--updateSnapshot") &&
    !args.includes("--watchAll")
      ? ["--watch"]
      : [];

  const config =
    !args.includes("--config") && !project.hasAnyFile("jest.config.js") && !project.package.has("jest")
      ? ["--config", JSON.stringify(require("../config/jest.config"))]
      : [];

  require("jest").run([...config, ...watch, ...args]);
  return { status: 0, exit: false };
};
