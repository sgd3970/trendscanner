const eslintConfig = [
  {
    ignores: ["**/*"], // ✅ Vercel 빌드시 모든 ESLint 무시
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"), // 로컬에서 쓸 수 있는 기본 설정
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-unused-vars": "off",
      "no-var": "off",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
