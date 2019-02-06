import { Project } from "toolkit-utils";
const debug = Boolean(process.env.DEBUG);

const project = new Project({ debug });
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
