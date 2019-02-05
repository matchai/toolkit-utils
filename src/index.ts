import Project from './helpers/project';

// If called from the CLI
if (require.main === module) {
  try {
    // project.executeFromCLIScript();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

export default new Project();
