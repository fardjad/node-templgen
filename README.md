# TemplGen

> Extensible template based file generator

## Features

- Easy to use TypeScript API
- ESM and CommonJS support
- Support for copying binary files as well as rendering template files
- Variable substitution in file names
- Use EJS (default) or any other template engine
- Overridable file system methods. You can override the default functions used
  to create directories, read files, write files, and copy files. That is
  useful for testing, logging, implementing interactive prompts, etc.

## Installation

```bash
npm install --save templgen
```

## Usage

```javascript
import { FileGenerator } from "templgen";

const sourceDirectory = "/source/directory";
const targetDirectory = "/target/directory";
const files = [
  // Will be copied to /target/directory/copy_as_is
  "/source/directory/copy_as_is",
  // Will be rendered with EJS and written to /target/directory/render_with_ejs
  "/source/directory/render_with_ejs.template",
  // Will be copied to /target/directory/subdir/replaced.txt
  "/source/directory/subdir/__variable__.txt",
];
const variables = {
  variable: "replaced",
};

const fileGenerator = new FileGenerator();
await fileGenerator.generate(
  sourceDirectory,
  targetDirectory,
  files,
  variables,
);
```

See [example](https://github.com/fardjad/node-templgen/tree/main/example) for a working example.

### Advanced Usage

#### Custom File System Functions

```javascript
import fs from "node:fs";
import { FileGenerator } from "templgen";

const sourceDirectory = "/source/directory";
const targetDirectory = "/target/directory";
const files = ["/source/directory/render_with_ejs.template"];
const variables = {
  variable: "replaced",
};

const myWriteFile = async (filePath, ...arguments_) => {
  console.log(`Writing file: ${path.relative(targetDirectory, filePath)}`);
  // you can show a prompt here
  return fs.promises.writeFile(filePath, ...arguments_);
};
const myCopyFile = async (sourcePath, destinationPath, ...arguments_) => {
  console.log(
    `Writing file: ${path.relative(targetDirectory, destinationPath)}`,
  );
  // you can show a prompt here
  return fs.promises.copyFile(sourcePath, destinationPath, ...arguments_);
};

const fileGenerator = new FileGenerator({
  writeFile: myWriteFile,
  copyFile: myCopyFile,
  // you can override mkdir and readFile too
});

await fileGenerator.generate(
  sourceDirectory,
  targetDirectory,
  files,
  variables,
);
```

#### Custom Template Engine

```javascript
import Handlebars from "handlebars";
import { FileGenerator } from "templgen";

const sourceDirectory = "/source/directory";
const targetDirectory = "/target/directory";
const files = [
  // Will be rendered with custom template engine and written to /target/directory/render_with_custom
  "/source/directory/render_with_custom.template",
];
const variables = {
  variable: "replaced",
};

const fileGenerator = new FileGenerator({
  render: async (template, variables, paths) =>
    // The paths in the paths object can be used for caching, logging, etc.
    console.log(paths);

    return Handlebars.compile(template)(variables),
});

await fileGenerator.generate(
  sourceDirectory,
  targetDirectory,
  files,
  variables,
);
```
