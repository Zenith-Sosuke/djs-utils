'use strict';

/**
 * @module builders
 * Fluent helpers for Discord.js v14 component builders.
 * Wraps ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder,
 * EmbedBuilder containers, and modal builders with sane defaults
 * and guard-rail validation.
 */

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
} = require('discord.js');

// ─── Buttons ──────────────────────────────────────────────────────────────────

/**
 * Build a single ButtonBuilder with common defaults filled in.
 *
 * @param {object} options
 * @param {string}       options.customId   - Required for non-link buttons.
 * @param {string}       options.label      - Button text (max 80 chars).
 * @param {ButtonStyle}  [options.style]    - Defaults to ButtonStyle.Primary.
 * @param {string}       [options.emoji]    - Unicode emoji or { id, name }.
 * @param {string}       [options.url]      - Required for ButtonStyle.Link.
 * @param {boolean}      [options.disabled] - Greyed-out state.
 * @returns {ButtonBuilder}
 *
 * @example
 * buildButton({ customId: 'confirm', label: 'Confirm', style: ButtonStyle.Success })
 */
function buildButton({ customId, label, style = ButtonStyle.Primary, emoji, url, disabled = false }) {
  const btn = new ButtonBuilder().setStyle(style).setDisabled(disabled);

  if (label) btn.setLabel(label.slice(0, 80));
  if (emoji) btn.setEmoji(emoji);
  if (style === ButtonStyle.Link && url) {
    btn.setURL(url);
  } else if (customId) {
    btn.setCustomId(customId);
  }

  return btn;
}

/**
 * Wrap any number of components into a single ActionRowBuilder.
 * Discord allows a max of 5 components per row.
 *
 * @param {...ButtonBuilder|StringSelectMenuBuilder} components
 * @returns {ActionRowBuilder}
 *
 * @example
 * buildRow(confirmBtn, cancelBtn)
 */
function buildRow(...components) {
  if (components.length > 5) throw new RangeError('An ActionRow can hold at most 5 components.');
  return new ActionRowBuilder().addComponents(...components);
}

/**
 * Build a confirm / cancel button row — the most common pattern.
 *
 * @param {object} [options]
 * @param {string} [options.confirmId='confirm']   - customId for the confirm button.
 * @param {string} [options.cancelId='cancel']     - customId for the cancel button.
 * @param {string} [options.confirmLabel='Confirm']
 * @param {string} [options.cancelLabel='Cancel']
 * @returns {ActionRowBuilder}
 *
 * @example
 * await interaction.reply({ embeds: [warnEmbed('Are you sure?')], components: [buildConfirmRow()] });
 */
function buildConfirmRow({
  confirmId    = 'confirm',
  cancelId     = 'cancel',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
} = {}) {
  return buildRow(
    buildButton({ customId: confirmId, label: confirmLabel, style: ButtonStyle.Success }),
    buildButton({ customId: cancelId,  label: cancelLabel,  style: ButtonStyle.Danger  }),
  );
}

/**
 * Disable every button inside an ActionRowBuilder.
 * Useful after a confirmation is received.
 *
 * @param {ActionRowBuilder} row
 * @returns {ActionRowBuilder} A new row with all buttons disabled.
 *
 * @example
 * await interaction.editReply({ components: [disableRow(row)] });
 */
function disableRow(row) {
  const disabled = row.components.map((c) =>
    ButtonBuilder.from(c).setDisabled(true)
  );
  return new ActionRowBuilder().addComponents(...disabled);
}

// ─── Select Menus ─────────────────────────────────────────────────────────────

/**
 * Build a StringSelectMenuBuilder from a plain array of option objects.
 *
 * @param {object} options
 * @param {string}   options.customId              - Select menu ID.
 * @param {string}   [options.placeholder]         - Grey placeholder text.
 * @param {number}   [options.minValues=1]
 * @param {number}   [options.maxValues=1]
 * @param {Array<{label:string, value:string, description?:string, emoji?:string, default?:boolean}>} options.options
 * @returns {StringSelectMenuBuilder}
 *
 * @example
 * buildSelectMenu({
 *   customId: 'pick-role',
 *   placeholder: 'Choose a role…',
 *   options: [
 *     { label: 'Muted',  value: 'muted'  },
 *     { label: 'Member', value: 'member', default: true },
 *   ],
 * })
 */
function buildSelectMenu({ customId, placeholder, minValues = 1, maxValues = 1, options = [] }) {
  if (!options.length) throw new RangeError('buildSelectMenu requires at least one option.');

  const menu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setMinValues(minValues)
    .setMaxValues(maxValues)
    .addOptions(
      options.map(({ label, value, description, emoji, default: isDefault }) => {
        const opt = new StringSelectMenuOptionBuilder()
          .setLabel(label)
          .setValue(value)
          .setDefault(isDefault ?? false);
        if (description) opt.setDescription(description.slice(0, 100));
        if (emoji)       opt.setEmoji(emoji);
        return opt;
      })
    );

  if (placeholder) menu.setPlaceholder(placeholder.slice(0, 150));
  return menu;
}

// ─── Modals ───────────────────────────────────────────────────────────────────

/**
 * Build a ModalBuilder from a plain config object.
 *
 * @param {object} options
 * @param {string}   options.customId   - Modal ID.
 * @param {string}   options.title      - Modal window title (max 45 chars).
 * @param {Array<{
 *   customId: string,
 *   label: string,
 *   style?: 'short'|'paragraph',
 *   placeholder?: string,
 *   required?: boolean,
 *   minLength?: number,
 *   maxLength?: number,
 *   value?: string,
 * }>} options.fields  - Between 1 and 5 text inputs.
 * @returns {ModalBuilder}
 *
 * @example
 * buildModal({
 *   customId: 'report-modal',
 *   title: 'Report a user',
 *   fields: [
 *     { customId: 'reason', label: 'Reason', style: 'paragraph', required: true },
 *   ],
 * })
 */
function buildModal({ customId, title, fields = [] }) {
  if (!fields.length || fields.length > 5)
    throw new RangeError('buildModal requires between 1 and 5 fields.');

  const modal = new ModalBuilder()
    .setCustomId(customId)
    .setTitle(title.slice(0, 45));

  const rows = fields.map(({ customId: id, label, style = 'short', placeholder, required = false, minLength, maxLength, value }) => {
    const input = new TextInputBuilder()
      .setCustomId(id)
      .setLabel(label.slice(0, 45))
      .setStyle(style === 'paragraph' ? TextInputStyle.Paragraph : TextInputStyle.Short)
      .setRequired(required);

    if (placeholder) input.setPlaceholder(placeholder.slice(0, 100));
    if (minLength   != null) input.setMinLength(minLength);
    if (maxLength   != null) input.setMaxLength(maxLength);
    if (value       != null) input.setValue(value);

    return new ActionRowBuilder().addComponents(input);
  });

  modal.addComponents(...rows);
  return modal;
}

// ─── Embed Containers ─────────────────────────────────────────────────────────

/**
 * Build a multi-field "card" embed — handy for user profiles, server stats, etc.
 *
 * @param {object} options
 * @param {string}   options.title
 * @param {string}   [options.thumbnail]  - URL shown top-right.
 * @param {string}   [options.image]      - Large image shown below fields.
 * @param {number}   [options.color]      - Hex integer. Defaults to 0x5865F2 (blurple).
 * @param {string}   [options.footer]
 * @param {Array<{name:string, value:string, inline?:boolean}>} options.fields
 * @returns {EmbedBuilder}
 *
 * @example
 * buildCard({
 *   title: `${user.tag}'s Profile`,
 *   thumbnail: user.displayAvatarURL(),
 *   fields: [
 *     { name: 'Joined', value: shortDate(member.joinedAt), inline: true },
 *     { name: 'Roles',  value: '3',                        inline: true },
 *   ],
 * })
 */
function buildCard({ title, thumbnail, image, color = 0x5865F2, footer, fields = [] }) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setTimestamp();

  if (thumbnail) embed.setThumbnail(thumbnail);
  if (image)     embed.setImage(image);
  if (footer)    embed.setFooter({ text: footer });
  if (fields.length) embed.addFields(fields.map(({ name, value, inline = false }) => ({ name, value, inline })));

  return embed;
}

/**
 * Split an array of fields into multiple "page" embeds, each with at most
 * `fieldsPerPage` fields. Useful with the paginate() helper.
 *
 * @param {Array<{name:string,value:string,inline?:boolean}>} fields
 * @param {object} [baseOptions]  - Same shape as buildCard options (minus fields).
 * @param {number} [fieldsPerPage=6]
 * @returns {EmbedBuilder[]}
 *
 * @example
 * const pages = buildFieldPages(allFields, { title: 'Server Members', color: 0x57F287 });
 * await paginate(interaction, pages);
 */
function buildFieldPages(fields, baseOptions = {}, fieldsPerPage = 6) {
  if (!fields.length) throw new RangeError('buildFieldPages requires at least one field.');
  const pages = [];
  for (let i = 0; i < fields.length; i += fieldsPerPage) {
    const slice = fields.slice(i, i + fieldsPerPage);
    pages.push(buildCard({ ...baseOptions, fields: slice }));
  }
  // Add page numbers to footers
  pages.forEach((p, idx) =>
    p.setFooter({ text: `Page ${idx + 1} of ${pages.length}` })
  );
  return pages;
}
/**
 * Sends a confirm/cancel prompt and waits for the user to click.
 * Automatically disables buttons after a response or timeout.
 *
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} options
 * @param {string}        options.question                  - The prompt text shown in the embed.
 * @param {string}        [options.confirmLabel='Confirm']
 * @param {string}        [options.cancelLabel='Cancel']
 * @param {number}        [options.timeout=15000]           - Ms before auto-cancelling.
 * @param {boolean}       [options.ephemeral=false]
 * @returns {Promise<boolean>} true if confirmed, false if cancelled or timed out.
 *
 * @example
 * const confirmed = await confirmAction(interaction, {
 *   question: 'Are you sure you want to ban this user?',
 *   confirmLabel: 'Yes, ban them',
 * });
 * if (!confirmed) return;
 * await safeBan(target, reason);
 */
async function confirmAction(interaction, {
  question,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  timeout      = 15_000,
  ephemeral    = false,
} = {}) {
  const { warnEmbed, errorEmbed } = require('./embeds');

  const row = buildConfirmRow({ confirmLabel, cancelLabel });

  const reply = await interaction.reply({
    embeds: [warnEmbed(question)],
    components: [row],
    ephemeral,
    fetchReply: true,
  });

  try {
    const i = await reply.awaitMessageComponent({
      filter: (btn) => btn.user.id === interaction.user.id,
      time: timeout,
    });

    const confirmed = i.customId === 'confirm';

    await i.update({
      embeds: [confirmed
        ? warnEmbed(question)
        : errorEmbed('Action cancelled.')
      ],
      components: [disableRow(row)],
    });

    return confirmed;
  } catch {
    // Timed out
    await interaction.editReply({
      embeds: [errorEmbed('Confirmation timed out.')],
      components: [disableRow(row)],
    });
    return false;
  }
}

module.exports = {
  // Buttons
  buildButton, 
  buildRow,
  buildConfirmRow,
  disableRow,
  // Select menus
  buildSelectMenu,
  // Modals
  buildModal,
  // Embed containers
  buildCard,
  buildFieldPages,
  // Helpers
  confirmAction,
};