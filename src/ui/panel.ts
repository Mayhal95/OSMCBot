import {
  ActionRowBuilder,
  ContainerBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  ThumbnailBuilder,
  type ButtonBuilder,
  type InteractionReplyOptions,
  type InteractionEditReplyOptions,
  type StringSelectMenuBuilder,
} from 'discord.js';

import { OSMC_THEME } from '../config/theme.js';

export type PanelTone = 'default' | 'success' | 'warning' | 'danger';

export interface PanelOptions {
  title: string;
  description: string;
  details?: readonly string[];
  ephemeral?: boolean;
  footer?: string;
  thumbnailUrl?: string;
  tone?: PanelTone;
  buttons?: readonly ButtonBuilder[];
  selectMenus?: readonly StringSelectMenuBuilder[];
}

const toneMarks: Record<PanelTone, string> = {
  default: '◆',
  success: '✓',
  warning: '⚠',
  danger: '✕',
};

export function createPanel(options: PanelOptions): ContainerBuilder {
  const title = `## ${toneMarks[options.tone ?? 'default']} ${options.title}`;
  const header = new TextDisplayBuilder().setContent(`${title}\n${options.description}`);
  const panel = new ContainerBuilder().setAccentColor(OSMC_THEME.colors.primary);

  if (options.thumbnailUrl) {
    panel.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(header)
        .setThumbnailAccessory(
          new ThumbnailBuilder()
            .setURL(options.thumbnailUrl)
            .setDescription(`${OSMC_THEME.name} club logo`),
        ),
    );
  } else {
    panel.addTextDisplayComponents(header);
  }

  if (options.details?.length) {
    panel
      .addSeparatorComponents(
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(options.details.map((item) => `- ${item}`).join('\n')),
      );
  }

  for (const selectMenu of options.selectMenus ?? []) {
    panel.addActionRowComponents(
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu),
    );
  }

  if (options.buttons?.length) {
    panel.addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(...options.buttons),
    );
  }

  panel
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${options.footer ?? OSMC_THEME.footer}`),
    );

  return panel;
}

export function createPanelEdit(options: PanelOptions): InteractionEditReplyOptions {
  return {
    components: [createPanel(options)],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  };
}

export function createPanelReply(options: PanelOptions): InteractionReplyOptions {
  const flags = options.ephemeral
    ? MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    : MessageFlags.IsComponentsV2;

  return {
    components: [createPanel(options)],
    flags,
    allowedMentions: { parse: [] },
  };
}
