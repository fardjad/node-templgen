import { FileGenerator, type RenderFunction } from "./index.ts";
import ejs from "ejs";
import { glob } from "glob";
import assert from "node:assert";
import fs from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

await test("computePath", async (t) => {
  const fileGenerator = new FileGenerator();
  const sourceDirectory = "/source/directory";
  const targetDirectory = "/target/directory";

  await t.test("path without extension", () => {
    const templateFilePath = `${sourceDirectory}/template/file/path`;

    const actual = fileGenerator.computePath(
      sourceDirectory,
      targetDirectory,
      templateFilePath,
      {},
    );

    const expected = `${targetDirectory}/template/file/path`;
    assert.strictEqual(actual, expected);
  });

  await t.test("path with .template extension", () => {
    const templateFilePath = `${sourceDirectory}/template/file/path.template`;

    const actual = fileGenerator.computePath(
      sourceDirectory,
      targetDirectory,
      templateFilePath,
      {},
    );

    const expected = `${targetDirectory}/template/file/path`;
    assert.strictEqual(actual, expected);
  });

  await t.test("path with arbitrary extension", () => {
    const templateFilePath = `${sourceDirectory}/template/file/path.ext`;

    const actual = fileGenerator.computePath(
      sourceDirectory,
      targetDirectory,
      templateFilePath,
      {},
    );

    const expected = `${targetDirectory}/template/file/path.ext`;
    assert.strictEqual(actual, expected);
  });

  await t.test("path with defined variables", () => {
    const templateFilePath = `${sourceDirectory}/template/__file__/path.__extension__`;
    const variables = {
      file: "file",
      // Extension trimming should be done before variable substitution
      extension: "template",
    };

    const actual = fileGenerator.computePath(
      sourceDirectory,
      targetDirectory,
      templateFilePath,
      variables,
    );

    const expected = `${targetDirectory}/template/file/path.template`;
    assert.strictEqual(actual, expected);
  });

  await t.test("path with undefined variables", () => {
    const templateFilePath = `${sourceDirectory}/template/__file__/path`;

    const actual = fileGenerator.computePath(
      sourceDirectory,
      targetDirectory,
      templateFilePath,
      {},
    );

    const expected = `${targetDirectory}/template/__file__/path`;
    assert.strictEqual(actual, expected);
  });
});

await test("generate", async (t) => {
  const writeFile = t.mock.fn<typeof fs.promises.writeFile>();
  const copyFile = t.mock.fn<typeof fs.promises.copyFile>();
  const mkdir = t.mock.fn<typeof fs.promises.mkdir>();
  const readFile = t.mock.fn(fs.promises.readFile);
  const render = t.mock.fn<RenderFunction>(async (template, data) =>
    ejs.render(template, data, { async: true }),
  );

  const fileGenerator = new FileGenerator({
    mkdir,
    readFile,
    writeFile,
    copyFile,
    render,
  });

  const sourceDirectory = fileURLToPath(
    new URL("__fixtures__", import.meta.url),
  );
  const targetDirectory = "/target/directory";
  const variables = {
    variable: "replaced",
    content: "content",
  };

  const files = await glob(`${sourceDirectory}/**/*`, {
    nodir: true,
    absolute: true,
  });

  await fileGenerator.generate(
    sourceDirectory,
    targetDirectory,
    files,
    variables,
  );

  assert.deepStrictEqual(
    mkdir.mock.calls.map((call) => call.arguments),
    [
      ["/target/directory", { recursive: true }],
      ["/target/directory", { recursive: true }],
      ["/target/directory/nested", { recursive: true }],
    ],
  );

  assert.deepStrictEqual(
    readFile.mock.calls.map((call) => call.arguments),
    [
      [
        fileURLToPath(new URL("__fixtures__/ejs.template", import.meta.url)),
        {
          encoding: "utf8",
        },
      ],
    ],
  );

  assert.deepStrictEqual(
    writeFile.mock.calls.map((call) => call.arguments),
    [
      [
        "/target/directory/ejs",
        "content",
        {
          encoding: "utf8",
        },
      ],
    ],
  );

  assert.deepStrictEqual(
    copyFile.mock.calls.map((call) => call.arguments),
    [
      [
        fileURLToPath(new URL("__fixtures__/copy_as_is", import.meta.url)),
        "/target/directory/copy_as_is",
      ],
      [
        fileURLToPath(
          new URL("__fixtures__/nested/__variable__", import.meta.url),
        ),
        "/target/directory/nested/replaced",
      ],
    ],
  );

  assert.deepStrictEqual(
    render.mock.calls.map((call) => call.arguments),
    [
      [
        "<%= content %>",
        {
          content: "content",
          variable: "replaced",
        },
      ],
    ],
  );
});
