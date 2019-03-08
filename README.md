<h3 align="center">toolkit-utilities</h3>
<p align="center">A set of reusable classes and utilities for creating toolkits</p>

---

Inspired by ["Tools without config"](https://blog.kentcdodds.com/automation-without-config-412ab5e47229), ["The Melting Pot of JavaScript"](https://youtu.be/G39lKaONAlA), and [kcd-scripts](https://github.com/kentcdodds/kcd-scripts).

This library provides utility classes and methods for creating toolkits, used to abstract much of the overhead involved in regular JS and TS tasks, such as testing, linting, formatting, building, etc.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [API](#api)
  - [Classes](#classes)
  - [Functions](#functions)
  - [Project](#project)
    - [new Project([options])](#new-projectoptions)
    - [project.srcDir](#projectsrcdir)
    - [project.scriptsDir](#projectscriptsdir)
    - [project.configDir](#projectconfigdir)
    - [project.toolkitName](#projecttoolkitname)
    - [project.toolkitRootDir](#projecttoolkitrootdir)
    - [project.name](#projectname)
    - [project.package](#projectpackage)
    - [project.isCompiled](#projectiscompiled)
    - [project.isTypeScript](#projectistypescript)
    - [project.toolkitBin](#projecttoolkitbin)
    - [project.availableScripts](#projectavailablescripts)
    - [project.fromRoot(...part) ⇒](#projectfromrootpart-%E2%87%92)
    - [project.fromToolkitRoot(...part) ⇒](#projectfromtoolkitrootpart-%E2%87%92)
    - [project.fromConfigDir(...part) ⇒](#projectfromconfigdirpart-%E2%87%92)
    - [project.fromScriptsDir(...part) ⇒](#projectfromscriptsdirpart-%E2%87%92)
    - [project.hasAnyDep(deps) ⇒](#projecthasanydepdeps-%E2%87%92)
    - [project.envIsSet(name) ⇒](#projectenvissetname-%E2%87%92)
    - [project.parseEnv(name, defaultValue) ⇒](#projectparseenvname-defaultvalue-%E2%87%92)
    - [project.packageHas(jsonPath) ⇒](#projectpackagehasjsonpath-%E2%87%92)
    - [project.packageGet(jsonPath) ⇒](#projectpackagegetjsonpath-%E2%87%92)
    - [project.packageSet(jsonPath, value)](#projectpackagesetjsonpath-value)
    - [project.hasScript(scriptFile) ⇒](#projecthasscriptscriptfile-%E2%87%92)
    - [project.hasAnyFile(fileNames)](#projecthasanyfilefilenames)
    - [project.writeFile(fileName, data)](#projectwritefilefilename-data)
    - [project.copyFile(sourceFile, newFile)](#projectcopyfilesourcefile-newfile)
    - [project.bin(executable)](#projectbinexecutable)
    - [project.getConcurrentlyArgs(scripts, killOthers) ⇒](#projectgetconcurrentlyargsscripts-killothers-%E2%87%92)
    - [project.executeScriptFile(scriptFile, args)](#projectexecutescriptfilescriptfile-args)
    - [project.executeFromCLI(exit) ⇒](#projectexecutefromcliexit-%E2%87%92)
    - [project.execute(...executables) ⇒ <code>IScriptResult</code>](#projectexecuteexecutables-%E2%87%92-codeiscriptresultcode)
  - [printHelp(scriptNames)](#printhelpscriptnames)
  - [replaceArgumentName(args, names, newName) ⇒](#replaceargumentnameargs-names-newname-%E2%87%92)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# API

## Classes

<dl>
<dt><a href="#Project">Project</a></dt>
<dd><p>The utility class for viewing and manipulating project properties as well as executing scripts.</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#printHelp">printHelp(scriptNames)</a></dt>
<dd><p>Prints the help message including the list of available scripts.</p></dd>
<dt><a href="#replaceArgumentName">replaceArgumentName(args, names, newName)</a> ⇒</dt>
<dd><p>Returns a new array, replacing an argument name with a new name. Does not mutate the original array.</p></dd>
</dl>

<a name="Project"></a>

## Project

<p>The utility class for viewing and manipulating project properties as well as executing scripts.</p>

**Kind**: global class

- [Project](#Project)
  - [new Project([options])](#new_Project_new)
  - [.srcDir](#Project+srcDir)
  - [.scriptsDir](#Project+scriptsDir)
  - [.configDir](#Project+configDir)
  - [.toolkitName](#Project+toolkitName)
  - [.toolkitRootDir](#Project+toolkitRootDir)
  - [.name](#Project+name)
  - [.package](#Project+package)
  - [.isCompiled](#Project+isCompiled)
  - [.isTypeScript](#Project+isTypeScript)
  - [.toolkitBin](#Project+toolkitBin)
  - [.availableScripts](#Project+availableScripts)
  - [.fromRoot(...part)](#Project+fromRoot) ⇒
  - [.fromToolkitRoot(...part)](#Project+fromToolkitRoot) ⇒
  - [.fromConfigDir(...part)](#Project+fromConfigDir) ⇒
  - [.fromScriptsDir(...part)](#Project+fromScriptsDir) ⇒
  - [.hasAnyDep(deps)](#Project+hasAnyDep) ⇒
  - [.envIsSet(name)](#Project+envIsSet) ⇒
  - [.parseEnv(name, defaultValue)](#Project+parseEnv) ⇒
  - [.packageHas(jsonPath)](#Project+packageHas) ⇒
  - [.packageGet(jsonPath)](#Project+packageGet) ⇒
  - [.packageSet(jsonPath, value)](#Project+packageSet)
  - [.hasScript(scriptFile)](#Project+hasScript) ⇒
  - [.hasAnyFile(fileNames)](#Project+hasAnyFile)
  - [.writeFile(fileName, data)](#Project+writeFile)
  - [.copyFile(sourceFile, newFile)](#Project+copyFile)
  - [.bin(executable)](#Project+bin)
  - [.getConcurrentlyArgs(scripts, killOthers)](#Project+getConcurrentlyArgs) ⇒
  - [.executeScriptFile(scriptFile, args)](#Project+executeScriptFile)
  - [.executeFromCLI(exit)](#Project+executeFromCLI) ⇒
  - [.execute(...executables)](#Project+execute) ⇒ <code>IScriptResult</code>

<a name="new_Project_new"></a>

### new Project([options])

<p>The utility class for viewing and manipulating project properties as well as executing scripts.</p>

| Param                 | Description                                                                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [options]             | <p>Options</p>                                                                                                                                                                    |
| [options.debug]       | <p>Enables debug logs.</p>                                                                                                                                                        |
| [options.silent]      | <p>Silences the logger.</p>                                                                                                                                                       |
| [options.logger]      | <p>The instance of Signale to be used as a logger.</p>                                                                                                                            |
| [options.filesDir]    | <p>The directory of the <code>scripts</code> and <code>config</code> directories. May be the <code>src</code> or <code>lib</code> directory where the toolkit is called from.</p> |
| [options.toolkitRoot] | <p>The root of the toolkit using this library.</p>                                                                                                                                |

<a name="Project+srcDir"></a>

### project.srcDir

<p>Path of the src dir in the toolkit.</p>

**Kind**: instance property of [<code>Project</code>](#Project)  
<a name="Project+scriptsDir"></a>

### project.scriptsDir

<p>Path of the scripts dir.</p>

**Kind**: instance property of [<code>Project</code>](#Project)  
<a name="Project+configDir"></a>

### project.configDir

<p>Path of the config dir.</p>

**Kind**: instance property of [<code>Project</code>](#Project)  
<a name="Project+toolkitName"></a>

### project.toolkitName

<p>The name of the toolkit.</p>

**Kind**: instance property of [<code>Project</code>](#Project)  
<a name="Project+toolkitRootDir"></a>

### project.toolkitRootDir

<p>Path of the root of the toolkit.</p>

**Kind**: instance property of [<code>Project</code>](#Project)  
<a name="Project+name"></a>

### project.name

<p>The name of the project</p>

**Kind**: instance property of [<code>Project</code>](#Project)  
<a name="Project+package"></a>

### project.package

<p>The full project package.json object.</p>

**Kind**: instance property of [<code>Project</code>](#Project)  
<a name="Project+isCompiled"></a>

### project.isCompiled

<p>Determine whether a project is compiled via Typescript or Babel.</p>

**Kind**: instance property of [<code>Project</code>](#Project)  
<a name="Project+isTypeScript"></a>

### project.isTypeScript

<p>Determine whether a project is a TypeScript project.</p>

**Kind**: instance property of [<code>Project</code>](#Project)  
<a name="Project+toolkitBin"></a>

### project.toolkitBin

<p>The command name of the toolkit's bin.</p>

**Kind**: instance property of [<code>Project</code>](#Project)  
<a name="Project+availableScripts"></a>

### project.availableScripts

<p>List of scripts available in this toolkit.</p>

**Kind**: instance property of [<code>Project</code>](#Project)  
<a name="Project+fromRoot"></a>

### project.fromRoot(...part) ⇒

<p>Returns the given path added to the path of the project root.
A path may be given as a single string or in multiple parts.</p>

**Kind**: instance method of [<code>Project</code>](#Project)  
**Returns**: <p>Path in root directory.</p>

| Param   | Description                           |
| ------- | ------------------------------------- |
| ...part | <p>Path relative to the root dir.</p> |

<a name="Project+fromToolkitRoot"></a>

### project.fromToolkitRoot(...part) ⇒

<p>Returns the given path added to the path of the toolkit root.
A path may be given as a single string or in multiple parts.</p>

**Kind**: instance method of [<code>Project</code>](#Project)  
**Returns**: <p>Path in toolkit root directory.</p>

| Param   | Description                                          |
| ------- | ---------------------------------------------------- |
| ...part | <p>Path relative to the root dir of the toolkit.</p> |

<a name="Project+fromConfigDir"></a>

### project.fromConfigDir(...part) ⇒

<p>Returns the given path added to path of the config directory.
A path may be given as a single string or in multiple parts.</p>

**Kind**: instance method of [<code>Project</code>](#Project)  
**Returns**: <p>Path in config directory.</p>

| Param   | Description                             |
| ------- | --------------------------------------- |
| ...part | <p>Path relative to the config dir.</p> |

<a name="Project+fromScriptsDir"></a>

### project.fromScriptsDir(...part) ⇒

<p>Returns the given path added to path of the scripts directory.
A path may be given as a single string or in multiple parts.</p>

**Kind**: instance method of [<code>Project</code>](#Project)  
**Returns**: <p>Path in scripts dir.</p>

| Param   | Description                              |
| ------- | ---------------------------------------- |
| ...part | <p>Path relative to the scripts dir.</p> |

<a name="Project+hasAnyDep"></a>

### project.hasAnyDep(deps) ⇒

<p>Returns one of the given values based on whether project has any of the given dependencies in <code>dependencies</code>, <code>devDependencies</code>, <code>peerDependencies</code>.</p>

**Kind**: instance method of [<code>Project</code>](#Project)  
**Returns**: <p>Boolean value based on the existence of dependency in package.json.</p>

| Param | Description                                 |
| ----- | ------------------------------------------- |
| deps  | <p>Dependency or dependencies to check.</p> |

<a name="Project+envIsSet"></a>

### project.envIsSet(name) ⇒

<p>Checks whether the given environment variable is set.</p>

**Kind**: instance method of [<code>Project</code>](#Project)  
**Returns**: <p>Whether the given environment variable is set.</p>

| Param | Description                                          |
| ----- | ---------------------------------------------------- |
| name  | <p>Name of the environment variable to look for.</p> |

<a name="Project+parseEnv"></a>

### project.parseEnv(name, defaultValue) ⇒

<p>Returns environment variable if it is set. Returns the default value otherwise.</p>

**Kind**: instance method of [<code>Project</code>](#Project)  
**Returns**: <p>Environment variable or default value</p>

| Param        | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| name         | <p>Name of the environment variable to look for.</p>         |
| defaultValue | <p>Default value if the environment variable is not net.</p> |

<a name="Project+packageHas"></a>

### project.packageHas(jsonPath) ⇒

<p>Checks if a given path is a direct property of the <code>package.json</code></p>

**Kind**: instance method of [<code>Project</code>](#Project)  
**Returns**: <p>Whether the given path is in the package file</p>

| Param    | Description              |
| -------- | ------------------------ |
| jsonPath | <p>The path to check</p> |

<a name="Project+packageGet"></a>

### project.packageGet(jsonPath) ⇒

<p>Provides the value at the given path within <code>package.json</code></p>

**Kind**: instance method of [<code>Project</code>](#Project)  
**Returns**: <p>The value at the given path in the package file</p>

| Param    | Description                         |
| -------- | ----------------------------------- |
| jsonPath | <p>The path to get a value from</p> |

<a name="Project+packageSet"></a>

### project.packageSet(jsonPath, value)

<p>Sets the value at the given path within <code>package.json</code></p>

**Kind**: instance method of [<code>Project</code>](#Project)

| Param    | Description                         |
| -------- | ----------------------------------- |
| jsonPath | <p>The path to get a value from</p> |
| value    | <p>The value to set at the path</p> |

<a name="Project+hasScript"></a>

### project.hasScript(scriptFile) ⇒

<p>Checks whether the given script exists in the scripts directory.</p>
<ol>
<li>If the given path is found, return it.</li>
<li>If the file name has no extension, looks for a file name with the extension in order of <code>ts</code>, <code>js</code>.</li>
<li>If the file name with an extension is found, return the full path of the file, including the extension.</li>
</ol>

**Kind**: instance method of [<code>Project</code>](#Project)  
**Returns**: <p>Full path of the script. Null if none is found.</p>

| Param      | Description                                       |
| ---------- | ------------------------------------------------- |
| scriptFile | <p>Script file to check for the existance of.</p> |

<a name="Project+hasAnyFile"></a>

### project.hasAnyFile(fileNames)

<p>Checks for a file with a matching filename in the project root.</p>

**Kind**: instance method of [<code>Project</code>](#Project)

| Param     | Description                                                                     |
| --------- | ------------------------------------------------------------------------------- |
| fileNames | <p>The filename(s) including the extension to look for in the project root.</p> |

<a name="Project+writeFile"></a>

### project.writeFile(fileName, data)

<p>Creates and writes the given data to a file in the project.</p>

**Kind**: instance method of [<code>Project</code>](#Project)

| Param    | Description                                                                              |
| -------- | ---------------------------------------------------------------------------------------- |
| fileName | <p>The name of the file to be written</p>                                                |
| data     | <p>The data to be written to the file. Objects that are provided will be serialized.</p> |

<a name="Project+copyFile"></a>

### project.copyFile(sourceFile, newFile)

<p>Copies a file from the toolkit to the project.
Paths should be given relative to the toolkit root and project root.</p>

**Kind**: instance method of [<code>Project</code>](#Project)

| Param      | Description                              |
| ---------- | ---------------------------------------- |
| sourceFile | <p>The path to the source file.</p>      |
| newFile    | <p>The path to the destination file.</p> |

<a name="Project+bin"></a>

### project.bin(executable)

<p>Returns the relative path to an executable located in <code>node_modules/.bin</code>.</p>

**Kind**: instance method of [<code>Project</code>](#Project)

| Param      | Description                        |
| ---------- | ---------------------------------- |
| executable | <p>The name of the executable.</p> |

<a name="Project+getConcurrentlyArgs"></a>

### project.getConcurrentlyArgs(scripts, killOthers) ⇒

<p>Given an object with keys as script names and values as commands, return parameters to pass concurrently.</p>

**Kind**: instance method of [<code>Project</code>](#Project)  
**Returns**: <ul>

<li>Arguments to use with concurrently</li>
</ul>

| Param      | Description                                                     |
| ---------- | --------------------------------------------------------------- |
| scripts    | <p>Object with script names as keys and commands as values.</p> |
| killOthers | <p>Whether all scripts should be killed if one fails.</p>       |

<a name="Project+executeScriptFile"></a>

### project.executeScriptFile(scriptFile, args)

<p>Executes a given script file's exported <code>script</code> function. The given script file should be in the &quot;scripts&quot; directory.</p>

**Kind**: instance method of [<code>Project</code>](#Project)

| Param      | Description                                                               |
| ---------- | ------------------------------------------------------------------------- |
| scriptFile | <p>The script file to execute from the &quot;scripts&quot; directory.</p> |
| args       | <p>A list of arguments to be passed to the script function.</p>           |

<a name="Project+executeFromCLI"></a>

### project.executeFromCLI(exit) ⇒

<p>Executes a script based on the script name that was passed in <code>process.argv</code>.</p>

**Kind**: instance method of [<code>Project</code>](#Project)  
**Returns**: <p>Result of script</p>

| Param | Description                          |
| ----- | ------------------------------------ |
| exit  | <p>Whether to exit from process.</p> |

<a name="Project+execute"></a>

### project.execute(...executables) ⇒ <code>IScriptResult</code>

<p>Executes a binary using <code>spawn.sync</code> with given arguments and returns results.
For a single [Executable](Executable), it executes and returns result. For multiple [Executables](Executable), it executes them
serially. Execution stops and the function returns result, if one of the commands fails (which adds previous results to <code>result.previousResults</code>).
If an object is provided with names as keys and [Executables](Executable) as values, it executes them using <code>concurrently</code>
and returns result of <code>concurrently</code>.</p>

**Kind**: instance method of [<code>Project</code>](#Project)  
**Returns**: <code>IScriptResult</code> - <ul>

<li>Result of the executable.</li>
</ul>

| Param          | Type                    | Description                       |
| -------------- | ----------------------- | --------------------------------- |
| ...executables | <code>Executable</code> | <p>Executable or executables.</p> |

**Example**

```js
// Execute some commands serially and concurrently. Commands in the object are executed concurrently.
// 1. `serial-command-1` is executed first.
// 2. `serial-command-2` is executed second.
// 3. Based on a condition, `serial-command-3` might be executed.
// 4. `build doc command`, `some-other-command`, and `tsc` are executed in parallel. (object keys are names used in logs)
// 5. Lastly, `other-serial-command` is executed.
const result = project.execute(
  ["serial-command-1", ["arg"]],
  "serial-command-2",
  someCondition ? "serial-command-3" : null,
  {
    my-parallel-job: ["build-doc-command", ["arg"],
    my-parallel-task: "some-other-command"
    builder: ["tsc", ["arg"]],
  },
  ["other-serial-command", ["arg"]],
);
```

<a name="printHelp"></a>

## printHelp(scriptNames)

<p>Prints the help message including the list of available scripts.</p>

**Kind**: global function

| Param       | Description                           |
| ----------- | ------------------------------------- |
| scriptNames | <p>The list of available scripts.</p> |

<a name="replaceArgumentName"></a>

## replaceArgumentName(args, names, newName) ⇒

<p>Returns a new array, replacing an argument name with a new name. Does not mutate the original array.</p>

**Kind**: global function  
**Returns**: <p>An array with the arguments replaced.</p>

| Param   | Description                                      |
| ------- | ------------------------------------------------ |
| args    | <p>Arguments array.</p>                          |
| names   | <p>Parameter names to look for in arguments.</p> |
| newName | <p>Parameter names to look for in arguments.</p> |

**Example**

```js
const arguments = ["--a", "--b"];
replaceArgumentName(arguments, ["--a"], "--c"); // -> ["--c", "--b"]
```
