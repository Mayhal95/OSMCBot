import { Collection } from 'discord.js';

import { aboutCommand } from './about.js';
import { pingCommand } from './ping.js';
import type { BotCommand } from './types.js';

export const commands = new Collection<string, BotCommand>();

for (const command of [aboutCommand, pingCommand]) {
  commands.set(command.data.name, command);
}
