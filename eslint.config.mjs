import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import("eslint").Linter.FlatConfig[]} */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // 사용하지 않는 변수 허용
      "@typescript-eslint/no-explicit-any": "off", // any 사용 허용
      "no-unused-vars": "off", // JS에서도 사용하지 않는 변수 허용
      "no-var": "off", // var 허용
      "react-hooks/exhaustive-deps": "warn", // useEffect 경고만 표시
    },
  },
];

export default eslintConfig;
