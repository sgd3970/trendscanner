import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // 사용하지 않는 변수 무시
      "@typescript-eslint/no-explicit-any": "off", // any 허용
      "no-unused-vars": "off", // JS 전용 no-unused-vars도 함께 비활성화
    },
  },
];

export default eslintConfig;
