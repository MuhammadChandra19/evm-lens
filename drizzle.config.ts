import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/repository/**/entity.ts",
  dialect: 'sqlite'
});