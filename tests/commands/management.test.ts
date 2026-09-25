import { describe, expect, it } from 'vitest';

import { memberCommand } from '../../src/commands/member.js';
import { rosterCommand } from '../../src/commands/roster.js';
import type { BotCommand } from '../../src/commands/types.js';

function subcommandNames(command: BotCommand): string[] {
  return command.data.toJSON().options?.map((option) => option.name) ?? [];
}

describe('management command definitions', () => {
  it('registers every requested member subcommand', () => {
    expect(subcommandNames(memberCommand)).toEqual(['register', 'view', 'edit', 'notes']);
  });

  it('registers roster view and sync subcommands', () => {
    expect(subcommandNames(rosterCommand)).toEqual(['view', 'sync']);
  });

  it('requires a Discord user for member registration', () => {
    const register = memberCommand.data
      .toJSON()
      .options?.find((option) => option.name === 'register');

    expect(register).toMatchObject({
      name: 'register',
      options: [{ name: 'member', required: true }],
    });
  });

  it('offers edit and removal actions for an existing member', () => {
    const edit = memberCommand.data.toJSON().options?.find((option) => option.name === 'edit');

    expect(edit).toMatchObject({
      name: 'edit',
      options: [
        { name: 'member', required: true },
        {
          name: 'action',
          choices: [
            { name: 'Edit profile', value: 'edit' },
            { name: 'Remove member', value: 'remove' },
          ],
        },
      ],
    });
  });
});
