const { Events, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");
const keyValueService = require("../services/keyValueService");
const { canManageTicket, canCloseTicket, getOwnerId, markTicketClosed, sendTicketCloseLog, normalizeTicketMetadata } = require("../utils/ticketUtils");

const confirme = "هل أنت متأكد من إغلاق التذكرة؟";
const discordTranscripts = require("discord-html-transcripts");

module.exports = (client7) => {
  client7.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    const { customId } = interaction;

    if (customId === "close") {
      const Ticket = await keyValueService.get("ticketDB", `TICKET-PANEL_${interaction.channel.id}`);
      if (!Ticket) return interaction.reply({ content: "❌ هذه القناة ليست تذكرة.", ephemeral: true });
      if (!canCloseTicket(interaction.member, interaction.user, Ticket)) {
        return interaction.reply({ content: "❌ لا تمتلك صلاحية إغلاق هذه التذكرة.", ephemeral: true });
      }

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("Yes11").setLabel("إغلاق").setEmoji("🔒").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("No11").setLabel("إلغاء").setStyle(ButtonStyle.Secondary)
      );
      return interaction.reply({ content: confirme, components: [row] });
    }

    if (customId === "Yes11") {
      const Ticket = await keyValueService.get("ticketDB", `TICKET-PANEL_${interaction.channel.id}`);
      if (!Ticket) return interaction.reply({ content: "❌ هذه القناة ليست تذكرة.", ephemeral: true });
      if (!canCloseTicket(interaction.member, interaction.user, Ticket)) {
        return interaction.reply({ content: "❌ لا تمتلك صلاحية إغلاق هذه التذكرة.", ephemeral: true });
      }

      const closedTicket = await markTicketClosed(interaction.channel, interaction.user);
      const ownerId = getOwnerId(closedTicket);
      if (ownerId) await interaction.channel.permissionOverwrites.edit(ownerId, { ViewChannel: false }).catch(() => {});

      const embed2 = new EmbedBuilder()
        .setDescription(`تم إغلاق التذكرة بواسطة ${interaction.user}`)
        .setColor("Yellow");
      const embed = new EmbedBuilder()
        .setDescription("```لوحة فريق الدعم.```")
        .setColor("DarkButNotBlack");
      const roww = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("delete").setLabel("حذف").setEmoji("🗑️").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("Open").setLabel("فتح").setEmoji("🔓").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("Tran").setLabel("نسخة نصية").setEmoji("📄").setStyle(ButtonStyle.Secondary)
      );

      await interaction.deferUpdate();
      await interaction.editReply({ content: "", embeds: [embed2, embed], components: [roww] });
      await sendTicketCloseLog(interaction.guild, closedTicket, interaction.channel, interaction.user);
      return;
    }

    if (customId === "No11") {
      await interaction.deferUpdate();
      return interaction.deleteReply();
    }

    if (customId === "delete") {
      const Ticket = await keyValueService.get("ticketDB", `TICKET-PANEL_${interaction.channel.id}`);
      if (!Ticket) return interaction.reply({ content: "❌ هذه القناة ليست تذكرة.", ephemeral: true });
      if (!canManageTicket(interaction.member, Ticket)) {
        return interaction.reply({ content: "❌ لا تمتلك صلاحية حذف هذه التذكرة.", ephemeral: true });
      }

      await interaction.reply({ content: `✅ سيتم حذف ${interaction.channel} خلال ثوانٍ.`, ephemeral: true });
      setTimeout(async () => {
        await interaction.channel.delete().catch(() => {});
      }, 5000);

      const Logs = await keyValueService.get("ticketDB", `LogsRoom_${interaction.guild.id}`);
      const logChannel = interaction.guild.channels.cache.get(Logs);
      const normalized = normalizeTicketMetadata(Ticket, interaction.channel);
      const embedLog = new EmbedBuilder()
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setTitle("حذف تذكرة")
        .setFields(
          { name: "اسم التذكرة", value: `${interaction.channel.name}` },
          { name: "صاحب التذكرة", value: normalized.ownerId ? `<@${normalized.ownerId}>` : "غير معروف" },
          { name: "حذف بواسطة", value: `${interaction.user}` }
        )
        .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

      logChannel?.send({ embeds: [embedLog] });
      await keyValueService.delete("ticketDB", `TICKET-PANEL_${interaction.channel.id}`);
      return;
    }

    if (customId === "Open") {
      const Ticket = await keyValueService.get("ticketDB", `TICKET-PANEL_${interaction.channel.id}`);
      if (!Ticket) return interaction.reply({ content: "❌ هذه القناة ليست تذكرة.", ephemeral: true });
      if (!canManageTicket(interaction.member, Ticket)) {
        return interaction.reply({ content: "❌ لا تمتلك صلاحية فتح هذه التذكرة.", ephemeral: true });
      }
      const ownerId = getOwnerId(Ticket);
      if (ownerId) await interaction.channel.permissionOverwrites.edit(ownerId, { ViewChannel: true }).catch(() => {});
      await interaction.deferUpdate();
      return interaction.deleteReply();
    }

    if (customId === "Tran") {
      const Ticket = await keyValueService.get("ticketDB", `TICKET-PANEL_${interaction.channel.id}`);
      if (!Ticket) return interaction.reply({ content: "❌ هذه القناة ليست تذكرة.", ephemeral: true });
      if (!canManageTicket(interaction.member, Ticket)) {
        return interaction.reply({ content: "❌ لا تمتلك صلاحية استخراج نسخة نصية لهذه التذكرة.", ephemeral: true });
      }

      const channel = interaction.channel;
      const attachment = await discordTranscripts.createTranscript(channel);
      const Logs = await keyValueService.get("ticketDB", `LogsRoom_${interaction.guild.id}`);
      const Trans = await keyValueService.get("ticketDB", `TransRoom_${interaction.guild.id}`);
      const logChannel = interaction.guild.channels.cache.get(Logs);
      const TransChannel = interaction.guild.channels.cache.get(Trans);
      const normalized = normalizeTicketMetadata(Ticket, interaction.channel);
      if (!TransChannel) {
        await interaction.reply({ content: "لم يتم تحديد روم النسخ النصية، استخدم /set-ticket-log لتحديده.", ephemeral: true });
        return;
      }
      const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setTitle("نسخة نصية للتذكرة")
        .setFields(
          { name: "اسم التذكرة", value: `${interaction.channel.name}` },
          { name: "صاحب التذكرة", value: normalized.ownerId ? `<@${normalized.ownerId}>` : "غير معروف" },
          { name: "استخرجها", value: `${interaction.user}` }
        )
        .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

      logChannel?.send({ embeds: [embed] });
      TransChannel?.send({ files: [attachment] });
      await interaction.reply({ content: `✅ تم استخراج نسخة نصية من #${interaction.channel.name} بنجاح.`, ephemeral: true });
    }
  });
};
