import globals from "globals";

export default [
  {
    ignores: ["js/xlsx.full.min.js", "patch_*.cjs", "test-caixa.js", "node_modules/**"]
  },
  {
    languageOptions: { 
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      "no-undef": "warn"
    }
  }
];
