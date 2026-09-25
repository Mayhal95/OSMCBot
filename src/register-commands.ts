import { REST, Routes } from 'discord.js';

import { commands } from './commands/index.js';
import { env } from './config/env.js';
import { logger } from './logger.js';

const definitions = commands.map((command) => command.data.toJSON());
const rest = new REST().setToken(env.DISCORD_TOKEN);

try {
  if (env.DISCORD_GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID), {
      body: definitions,
    });
    logger.info(
      { commandCount: definitions.length, guildId: env.DISCORD_GUILD_ID },
      'Registered development guild commands',
    );
  } else {
    await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body: definitions });
    logger.info(
      { commandCount: definitions.length },
      'Registered global commands; Discord may take time to propagate them',
    );
  }
} catch (error) {
  logger.fatal({ error }, 'Failed to register Discord commands');
  process.exitCode = 1;
}
