const { Project } = require('toolkit-utils');
const debug = Boolean(process.env.DEBUG);

const project = new Project();
module.exports = project;
