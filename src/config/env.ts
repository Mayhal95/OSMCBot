import 'dotenv/config';

import { z } from 'zod';

const snowflake = z.string().regex(/^\d{17,20}$/, 'must be a valid Discord ID');

const environmentSchema = z.object({
  DISCORD_TOKEN: z.string().min(1, 'is required'),
  DISCORD_CLIENT_ID: snowflake,
  DISCORD_GUILD_ID: z.preprocess(
    (value) => (value === '' ? undefined : value),
    snowflake.optional(),
  ),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const details = z.prettifyError(parsedEnvironment.error);
  throw new Error(`Environment configuration is invalid:\n${details}`);
}

export const env = parsedEnvironment.data;
