import ejs from "ejs";
import fs from "node:fs";
import path from "node:path";

export type RenderFunction = (
  /** The template to render */
  template: string,
  /** The variables to substitute in the template */
  data?: Record<string, unknown>,
  /** The paths of the files/directories involved in the rendering */
  paths?: {
    sourceDirectory: string;
    targetDirectory: string;
    templateFilePath: string;
    targetFilePath: string;
  },
) => Promise<string>;

export type FileGeneratorOptions = {
  /** The function used to create directories. Has the same signature of {@link fs.promises.mkdir} */
  mkdir: typeof fs.promises.mkdir;
  /** The function used to read files. Has the same signature of {@link fs.readFile} */
  readFile: typeof fs.promises.readFile;
  /** The function used to write files. Has the same signature of {@link fs.writeFile} */
  writeFile: typeof fs.promises.writeFile;
  /** The function used to copy files. Has the same signature of {@link fs.copyFile} */
  copyFile: typeof fs.promises.copyFile;
  /** The function used to render templates */
  render: RenderFunction;
  /** The extension of the template files */
  templateExtension: string;
};

export class FileGenerator {
  #mkdir: FileGeneratorOptions["mkdir"];
  #readFile: FileGeneratorOptions["readFile"];
  #writeFile: FileGeneratorOptions["writeFile"];
  #copyFile: FileGeneratorOptions["copyFile"];
  #render: FileGeneratorOptions["render"];
  #templateExtension: FileGeneratorOptions["templateExtension"];

  /**
   *
   * @param options The options to configure the file generator. You can override the default functions used to create
   * directories, read files, write files, copy files and render templates.
   * @see {@link FileGeneratorOptions} for more details about the options.
   */
  constructor({
    mkdir,
    readFile,
    writeFile,
    copyFile,
    render,
    templateExtension,
  }: Partial<FileGeneratorOptions> = {}) {
    this.#mkdir = mkdir ?? fs.promises.mkdir;
    this.#readFile = readFile ?? fs.promises.readFile;
    this.#writeFile = writeFile ?? fs.promises.writeFile;
    this.#copyFile = copyFile ?? fs.promises.copyFile;
    this.#render =
      render ??
      (async (template, data) => ejs.render(template, data, { async: true }));
    this.#templateExtension = templateExtension ?? ".template";
  }

  /**
   * Generates files from templates. It goes through each template file path and generates the corresponding file in
   * the target directory while substituting the variables.
   * @see {@link computePath} for more details about the substitution.
   *
   * @param sourceDirectory The directory (base directory) where the template files are located
   * @param targetDirectory The directory (base directory) where the generated files will be located
   * @param fullTemplateFilePaths The full paths to the template files
   * @param variables The variables to substitute in the file paths and in the templates
   */
  async generate(
    sourceDirectory: string,
    targetDirectory: string,
    fullTemplateFilePaths: string[],
    variables: Record<string, unknown>,
  ): Promise<void> {
    for (const templateFilePath of fullTemplateFilePaths) {
      const computedPath = this.computePath(
        sourceDirectory,
        targetDirectory,
        templateFilePath,
        variables,
      );

      await this.#mkdir(path.dirname(computedPath), { recursive: true });
      if (path.extname(templateFilePath) === this.#templateExtension) {
        const template = await this.#readFile(templateFilePath, {
          encoding: "utf8",
        });
        const renderedContent = await this.#render(template, variables, {
          sourceDirectory,
          targetDirectory,
          templateFilePath,
          targetFilePath: computedPath,
        });
        await this.#writeFile(computedPath, renderedContent, {
          encoding: "utf8",
        });
      } else {
        await this.#copyFile(templateFilePath, computedPath);
      }
    }
  }

  // Inspired by https://github.com/nrwl/nx/blob/master/packages/devkit/src/generators/generate-files.ts
  /**
   * Computes the path of a to-be-generated file based on the template file path and the variables.
   *
   * Variables can be defined in the template file path like this: `__variable__`.
   * In this case, `__variable__` will be replaced by the value of `variable` property in the {@link variables} object.
   * The template extension will be removed from the template file path before the variables are replaced.
   * If a variable is not defined in the {@link variables} object, it will be left as is.
   *
   * @param sourceDirectory The directory (base directory) where the template file is located
   * @param targetDirectory The directory (base directory) where the generated file will be located
   * @param templateFilePath The full path to the template file
   * @param variables The variables to substitute in the file path
   * @returns The computed path of the to-be-generated file
   */
  computePath(
    sourceDirectory: string,
    targetDirectory: string,
    templateFilePath: string,
    variables: Record<string, unknown>,
  ): string {
    const relativeFromSourceFolder = path.relative(
      sourceDirectory,
      templateFilePath,
    );
    let computedPath = path.join(targetDirectory, relativeFromSourceFolder);
    computedPath = this.#removeExtensionIfExists(
      computedPath,
      this.#templateExtension,
    );

    for (const [key, value] of Object.entries(variables)) {
      computedPath = computedPath.split(`__${key}__`).join(String(value));
    }

    return computedPath;
  }

  #removeExtensionIfExists(filePath: string, extension: string): string {
    if (path.extname(filePath) === this.#templateExtension) {
      return filePath.slice(0, -1 * extension.length);
    }

    return filePath;
  }
}
