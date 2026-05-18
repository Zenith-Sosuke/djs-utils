'use strict';

/**
 * @module buttonMenu
 * An interactive button menu system supporting both classic embeds
 * and Discord's Components V2 (ContainerBuilder).
 */

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');

/**
 * Sends an interactive button menu and calls the matching callback when clicked.
 * Supports classic embed mode and Components V2 container mode.
 *
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} options
 * @param {string}   options.content                - Text shown above the buttons.
 * @param {Array<{
 *   id: string,
 *   label: string,
 *   style?: ButtonStyle,
 *   emoji?: string,
 *   callback: (i: import('discord.js').ButtonInteraction) => Promise<void>
 * }>}             options.buttons                  - Max 5 buttons.
 * @param {number}  [options.timeout=60000]         - Ms before buttons are disabled.
 * @param {boolean} [options.ephemeral=false]
 * @param {boolean} [options.useV2=false]           - Use Components V2 container layout.
 * @param {number}  [options.accentColor=0x5865F2]  - Accent color (V2 mode only).
 * @returns {Promise<void>}
 *
 * @example
 * // Classic mode
 * await buttonMenu(interaction, {
 *   content: 'What do you want to do?',
 *   buttons: [
 *     { id: 'stats',     label: 'View Stats',      callback: async (i) => i.update({ content: 'Here are your stats...',     components: [] }) },
 *     { id: 'inventory', label: 'View Inventory',  callback: async (i) => i.update({ content: 'Here is your inventory...', components: [] }) },
 *   ],
 * });
 *
 * @example
 * // Components V2 mode
 * await buttonMenu(interaction, {
 *   content: '## ⚙️ Settings\nChoose an option below.',
 *   useV2: true,
 *   accentColor: 0x5865F2,
 *   buttons: [
 *     { id: 'notifs', label: 'Notifications', callback: async (i) => { ... } },
 *     { id: 'privacy', label: 'Privacy',      callback: async (i) => { ... } },
 *   ],
 * });
 */
async function buttonMenu(interaction, {
  content,
  buttons = [],
  timeout      = 60_000,
  ephemeral    = false,
  useV2        = false,
  accentColor  = 0x5865F2,
} = {}) {
  if (!buttons.length || buttons.length > 5)
    throw new RangeError('buttonMenu requires between 1 and 5 buttons.');

  // Build the action row
  const row = new ActionRowBuilder().addComponents(
    ...buttons.map(({ id, label, style = ButtonStyle.Primary, emoji }) => {
      const btn = new ButtonBuilder()
        .setCustomId(id)
        .setStyle(style)
        .setLabel(label.slice(0, 80));
      if (emoji) btn.setEmoji(emoji);
      return btn;
    })
  );

  // Build the reply payload
  let payload;

  if (useV2) {
    const {
      ContainerBuilder,
      TextDisplayBuilder,
    } = require('discord.js');

    const container = new ContainerBuilder();
    if (accentColor != null) container.setAccentColor(accentColor);
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
    container.addActionRowComponents(row);

    payload = {
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      ephemeral,
      fetchReply: true,
    };
  } else {
    const { infoEmbed } = require('./embeds');
    payload = {
      embeds: [infoEmbed(content)],
      components: [row],
      ephemeral,
      fetchReply: true,
    };
  }

  const reply = await interaction.reply(payload);

  // Collect button clicks
  const collector = reply.createMessageComponentCollector({
    filter: (i) => i.user.id === interaction.user.id,
    time: timeout,
  });

  collector.on('collect', async (i) => {
    const match = buttons.find((b) => b.id === i.customId);
    if (match) await match.callback(i);
  });

  collector.on('end', async (_, reason) => {
    if (reason !== 'time') return;

    // Disable all buttons on timeout
    const disabledRow = new ActionRowBuilder().addComponents(
      ...buttons.map(({ id, label, style = ButtonStyle.Primary }) =>
        new ButtonBuilder()
          .setCustomId(id)
          .setLabel(label.slice(0, 80))
          .setStyle(style)
          .setDisabled(true)
      )
    );

    try {
      if (useV2) {
        const { ContainerBuilder, TextDisplayBuilder } = require('discord.js');
        const container = new ContainerBuilder();
        if (accentColor != null) container.setAccentColor(accentColor);
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
        container.addActionRowComponents(disabledRow);

        await interaction.editReply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      } else {
        await interaction.editReply({ components: [disabledRow] });
      }
    } catch {} // message may have been deleted
  });
}

module.exports = { buttonMenu };