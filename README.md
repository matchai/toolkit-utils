<h3 align="center">auth0-toolkit</h3>
<p align="center">CLI toolbox for common scripts for JS/TS Auth0 projects</p>

---

Inspired by ["Tools without config"](https://blog.kentcdodds.com/automation-without-config-412ab5e47229), ["The Melting Pot of JavaScript"](https://youtu.be/G39lKaONAlA), and [kcd-scripts](https://github.com/kentcdodds/kcd-scripts).

## Usage

1. Create a project:
   - `npm init new-auth0-project`
   - If it's a TypeScript project: add `types` into `package.json`. For example:
     - `{ "types": "lib/index" }`
1. Install auth-toolkit:
   - `npm install --save-dev auth0-toolkit`
1. Use included scripts:
   - `npm run build -- --watch`
   - `npm run build:doc`
   - `npm run validate`
   - `npm run commit`
   - `npm run release`
   - ... etc.

# Configuration

This toolkit exposes a bin called `auth0-toolkit`. All scripts are stored in `lib/scripts` and all configuration files are stored in `lib/config`.

The toolkit determines whether a project is a TypeScript project or JavaScript project depending on whether the `types`
property exists in `package.json`.

All included tools can have their configuration overwritten by adding flags to the command or by including configuration files in the root of your project. For example: running `auth0-toolkit format` will run Prettier with the included configuration, but having a `.prettierrc` in your project will cause the toolkit to use that configuration instead.
