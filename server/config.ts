// src/config.ts
import { z } from "zod";

const configSchema = z.object({
    NODE_ENV: z.string().optional().default("development"),
    APP_URL: z.string().url().optional(),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string(),
    SENTRY_DSN: z.string().optional(),
});

export const config = configSchema.parse(process.env);
export type ENV = typeof config;
