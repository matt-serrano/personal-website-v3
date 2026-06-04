import { defineConfig } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypeScript from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    ignores: [
      ".next/**",
      "next-env.d.ts",
      "out/**",
    ],
    rules: {
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
])
