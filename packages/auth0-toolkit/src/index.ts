import { Project } from "toolkit-utils";

const project: Project = require("./project");
export default project;

// If called from the CLI
if (require.main === module) {
  try {
    project.executeFromCLI();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
