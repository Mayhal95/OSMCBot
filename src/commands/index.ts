import { Collection } from 'discord.js';

import { aboutCommand } from './about.js';
import { memberCommand } from './member.js';
import { pingCommand } from './ping.js';
import { rosterCommand } from './roster.js';
import type { BotCommand } from './types.js';

export const commands = new Collection<string, BotCommand>();

for (const command of [aboutCommand, memberCommand, pingCommand, rosterCommand]) {
  commands.set(command.data.name, command);
}
