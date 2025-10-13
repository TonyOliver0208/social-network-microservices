import { z } from "zod";

export const rateLimitEnvSchema = z.object({
  RATE_LIMIT_WINDOW_MS: z.string().default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z.string().default("100"),
  RATE_LIMIT_STRICT_MAX: z.string().default("20"),
  NODE_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
});

export const rateLimitEnv = rateLimitEnvSchema.parse(process.env);

export const rateLimitConfig = {
  general: {
    windowMs: parseInt(rateLimitEnv.RATE_LIMIT_WINDOW_MS, 10),
    max: parseInt(rateLimitEnv.RATE_LIMIT_MAX_REQUESTS, 10),
    prefix: "rl:general:",
  },

  strict: {
    windowMs: parseInt(rateLimitEnv.RATE_LIMIT_WINDOW_MS, 10),
    max: parseInt(rateLimitEnv.RATE_LIMIT_STRICT_MAX, 10),
    prefix: "rl:strict:",
  },

  ultraStrict: {
    windowMs: 60 * 60 * 1000,
    max: 5,
    prefix: "rl:ultra:",
  },
};
