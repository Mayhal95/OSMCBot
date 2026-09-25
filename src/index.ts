import { ActivityType, Client, Events, GatewayIntentBits, MessageFlags } from 'discord.js';

import { commands } from './commands/index.js';
import { env } from './config/env.js';
import { logger } from './logger.js';
import { createPanel } from './ui/panel.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  presence: {
    activities: [{ name: 'over the Obsidian Serpents', type: ActivityType.Watching }],
    status: 'online',
  },
});

client.once(Events.ClientReady, (readyClient) => {
  logger.info(
    {
      guildCount: readyClient.guilds.cache.size,
      tag: readyClient.user.tag,
    },
    'OSMC bot is ready',
  );
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) {
    logger.warn({ commandName: interaction.commandName }, 'Received an unknown command');
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(
      {
        commandName: interaction.commandName,
        error,
        guildId: interaction.guildId,
        userId: interaction.user.id,
      },
      'Command execution failed',
    );

    const errorReply = {
      components: [
        createPanel({
          title: 'Something Went Wrong',
          description: 'The request could not be completed. Please try again in a moment.',
          tone: 'danger' as const,
        }),
      ],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      allowedMentions: { parse: [] as const },
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorReply).catch((replyError: unknown) => {
        logger.error({ error: replyError }, 'Failed to send command error follow-up');
      });
    } else {
      await interaction.reply(errorReply).catch((replyError: unknown) => {
        logger.error({ error: replyError }, 'Failed to send command error reply');
      });
    }
  }
});

client.on(Events.Error, (error) => {
  logger.error({ error }, 'Discord client error');
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info({ signal }, 'Shutting down OSMC bot');
  await client.destroy();
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

process.on('unhandledRejection', (error) => {
  logger.fatal({ error }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception');
  process.exitCode = 1;
});

try {
  await client.login(env.DISCORD_TOKEN);
} catch (error) {
  logger.fatal({ error }, 'Failed to log in to Discord');
  process.exitCode = 1;
}
