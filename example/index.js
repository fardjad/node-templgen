import * as commander from "commander";
import { glob } from "glob";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rimrafSync } from "rimraf";
import { FileGenerator } from "templgen";
import tree from "tree-node-cli";

commander.program
  .description("Generate files from templates")
  .requiredOption(
    "-c, --content <content>",
    "Contents of generated dynamic_content.txt",
  )
  .requiredOption(
    "-n, --number <number>",
    "Number of generated files from nested/__dynamic_filename__.txt",
    (value) => {
      const number = Number(value);
      if (Number.isNaN(number)) {
        throw new commander.InvalidArgumentError("Invalid number!");
      }

      return number;
    },
  )
  .requiredOption(
    "-p, --prefix <prefix>",
    "Filename prefix of generated files from nested/__dynamic_filename__.txt. The generated files will be named <prefix>_1.txt, <prefix>_2.txt, etc.",
  );

commander.program.parse();
const {
  content,
  prefix,
  number: numberOfFilesToGenerate,
} = commander.program.opts();

const templatesDirectory = fileURLToPath(new URL("templates", import.meta.url));

console.log("Templates directory:\n");
console.log(tree(templatesDirectory));

const targetDirectory = fileURLToPath(new URL("generated", import.meta.url));

const loggingWriteFile = async (filePath, ...arguments_) => {
  console.log(`Writing file: ${path.relative(targetDirectory, filePath)}`);
  return fs.promises.writeFile(filePath, ...arguments_);
};

const loggingCopyFile = async (sourcePath, destinationPath, ...arguments_) => {
  console.log(
    `Writing file: ${path.relative(targetDirectory, destinationPath)}`,
  );
  return fs.promises.copyFile(sourcePath, destinationPath, ...arguments_);
};

const fileGenerator = new FileGenerator({
  copyFile: loggingCopyFile,
  writeFile: loggingWriteFile,
});

console.log("\nGenerating files...\n");
rimrafSync(targetDirectory);

// Generate files with dynamic names
const dynamicTemplateFilePaths = [
  path.join(templatesDirectory, "nested/__dynamic_filename__.txt.template"),
];
for (let index = 1; index <= numberOfFilesToGenerate; index += 1) {
  await fileGenerator.generate(
    templatesDirectory,
    targetDirectory,
    dynamicTemplateFilePaths,
    { dynamic_filename: `${prefix}_${index}`, index },
  );
}

// Generate files with static names
const staticTemplateFilePaths = glob.sync(
  path.join(templatesDirectory, "**/*"),
  {
    ignore: dynamicTemplateFilePaths,
    absolute: true,
    nodir: true,
  },
);

await fileGenerator.generate(
  templatesDirectory,
  targetDirectory,
  staticTemplateFilePaths,
  { dynamicContent: content },
);

console.log("\nDone\n");

console.log("Target directory:");
console.log(tree(targetDirectory));
