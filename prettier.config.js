/** @type {import('prettier').Config} */
module.exports = {
    tabWidth: 4,
    printWidth: 100,
    importOrder: [
        "^(react/(.*)$)|^(react$)",
        "^(hono/(.*)$)|^(hono$)",
        "^(drizzle-orm/(.*)$)|^(drizzle-orm$)",
        "^(@tanstack/react-router/(.*)$)|^(@tanstack/react-router$)",
        "^(@tanstack/(.*)$)|^(@tanstack$)",
        "",
        "<THIRD_PARTY_MODULES>",
        "",
        "^types$",
        "^@/shared/(.*)$",
        "^@/lib/(.*)$",
        "^@/hooks/(.*)$",
        "^@/components/ui/(.*)$",
        "^@/components/(.*)$",
        "^\$/server-types/(.*)$",
        "",
        "^[./]",
    ],
    importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
    plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
};
