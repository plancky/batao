// src/config.ts
import { z } from "zod";

const configSchema = z.object({
    NODE_ENV: z.string().optional().default("development"),
    APP_URL: z.string().url(),
    DATABASE_URL: z.string().url().optional(),
    JWT_SECRET: z.string().optional(),
    SENTRY_DSN: z.string().optional(),
});

export function parseConfig() {
    const config = configSchema.parse(process.env)
}

export const config = configSchema.parse(process.env);
export type ENV = typeof config;
