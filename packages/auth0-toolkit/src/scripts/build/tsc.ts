import { Project, ScriptKit, Script, Executable, replaceArgumentName } from 'toolkit-utils';
import fs from "fs-extra";

export const script: Script = function script(project: Project, rawArgs: Array<any>, s: ScriptKit) {
  // tsc uses --outDir instead of --out-dir
  const args = replaceArgumentName(rawArgs, "--out-dir", "--outDir");
  const useSpecifiedOutDir = args.includes("--outDir");
  const outDir = useSpecifiedOutDir ? [] : ["--outDir", "lib"];
  const willWatch = args.includes("--watch");
  const willClean = !args.includes("--no-clean");

  if (!useSpecifiedOutDir && willClean) {
    fs.removeSync(project.fromRoot(outDir[1]));
  }

  const fileExtRx = "/(^.?|.[^d]|[^.]d|[^.][^d]).ts$/"; // Matches .ts but not .d.ts

  const rsyncScript = s.hereRelative("../../helper-scripts/rsync-non-ts.sh");
  console.log(rsyncScript);
  const tsc: Executable = ["tsc", outDir.concat(args)];
  const chokidar = `chokidar -i '${fileExtRx}' --initial --verbose -c '${rsyncScript} {event} {path}' 'src'`;

  return project.execute({ tsc, rsync: willWatch ? chokidar : rsyncScript });
};
