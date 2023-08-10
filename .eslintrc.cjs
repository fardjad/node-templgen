module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["plugin:unicorn/recommended", "xo", "prettier"],
  ignorePatterns: ["dist", "coverage"],
  rules: {
    "no-await-in-loop": "off",
    camelcase: "off",
  },
  overrides: [
    {
      files: ["*.ts", "*.mts"],
      extends: [
        "plugin:unicorn/recommended",
        "xo",
        "xo-typescript",
        "prettier",
      ],
      plugins: ["@typescript-eslint"],
      rules: {
        "no-await-in-loop": "off",
      },
    },
  ],
};
