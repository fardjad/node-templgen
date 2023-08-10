# TemplGen

> Extensible template based file generator

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

See [example](./example) for a complete example.
