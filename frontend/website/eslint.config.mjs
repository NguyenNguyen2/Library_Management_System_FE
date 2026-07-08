import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "no-multiple-empty-lines": [
        "error",
        { max: 1, maxEOF: 1, maxBOF: 0 },
      ],
      // eslint-plugin-react-hooks@4.6.2 (kéo theo bởi eslint-config-next) gọi
      // context.getSource() — API đã bị gỡ khỏi ESLint 9, khiến rule này crash
      // toàn bộ tiến trình lint (không chỉ báo lỗi, mà throw exception) trên
      // bất kỳ file nào có useEffect/useMemo có dependency array. Tắt riêng
      // rule này để lint chạy được; rules-of-hooks (rule quan trọng hơn) vẫn bật.
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default eslintConfig;
