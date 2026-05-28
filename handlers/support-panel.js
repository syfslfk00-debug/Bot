const { ChatInputCommandInteraction, Client, Events, ModalBuilder, TextInputStyle, EmbedBuilder, TextInputBuilder, ActionRowBuilder } = require("discord.js");
const keyValueService = require("../services/keyValueService");
const { canManageTicket } = require("../utils/ticketUtils");

/**
 * @param {Client} client27
 */
module.exports = (client27) => {
  client27.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "supportPanel") {
        const ticket = await keyValueService.get("ticketDB", `TICKET-PANEL_${interaction.channel.id}`);
        if (!ticket) return interaction.reply({ content: "❌ هذه القناة ليست تذكرة.", ephemeral: true });
        if (!canManageTicket(interaction.member, ticket)) {
          return interaction.reply({ content: "**لا تمتلك الصلاحية لفعل هذا**", ephemeral: true });
        }

        if (interaction.values[0] === "renameTicket") {
          const modal = new ModalBuilder().setTitle("تغيير اسم التكت").setCustomId("renameTicketSubmitModal");
          const newNameInp = new TextInputBuilder().setCustomId("newNameValue").setLabel("اسم التذكرة الجديد").setStyle(TextInputStyle.Short).setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(newNameInp));
          await interaction.showModal(modal);
        } else if (interaction.values[0] === "addMemberToTicket") {
          const modal = new ModalBuilder().setTitle("اضافة عضو للتذكرة").setCustomId("addMemberToTicketSubmitModal");
          const memberIdInp = new TextInputBuilder().setCustomId("addMemberToTicketMemberId").setLabel("ايدي العضو").setStyle(TextInputStyle.Short).setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(memberIdInp));
          await interaction.showModal(modal);
        } else if (interaction.values[0] === "removeMemberFromTicket") {
          const modal = new ModalBuilder().setTitle("حذف عضو من التذكرة").setCustomId("removeMemberFromTicketSubmitModal");
          const memberIdInp = new TextInputBuilder().setCustomId("removeMemberFromTicketMemberId").setLabel("ايدي العضو").setStyle(TextInputStyle.Short).setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(memberIdInp));
          await interaction.showModal(modal);
        } else if (interaction.values[0] === "refreshSupportPanel") {
          try {
            return await interaction.update().catch(async () => { return; });
          } catch {
            return;
          }
        }
      }
    }

    if (interaction.isModalSubmit()) {
      const ticket = await keyValueService.get("ticketDB", `TICKET-PANEL_${interaction.channel.id}`);
      if (["renameTicketSubmitModal", "addMemberToTicketSubmitModal", "removeMemberFromTicketSubmitModal"].includes(interaction.customId)) {
        if (!ticket) return interaction.reply({ content: "❌ هذه القناة ليست تذكرة.", ephemeral: true });
        if (!canManageTicket(interaction.member, ticket)) {
          return interaction.reply({ content: "**لا تمتلك الصلاحية لفعل هذا**", ephemeral: true });
        }
      }

      if (interaction.customId === "renameTicketSubmitModal") {
        const newName = interaction.fields.getTextInputValue("newNameValue");
        await interaction.reply({ embeds: [new EmbedBuilder().setColor("Green").setDescription(`**تم تغيير اسم التكت إلى \`${newName}\`**`).setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }).setFooter({ text: `طلب بواسطة: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })] });
        await interaction.channel.setName(newName);
      } else if (interaction.customId === "addMemberToTicketSubmitModal") {
        const memberId = interaction.fields.getTextInputValue("addMemberToTicketMemberId");
        const theMember = await client27.users.fetch(memberId).catch(() => null);
        if (theMember) {
          await interaction.reply({ embeds: [new EmbedBuilder().setColor("Green").setDescription(`**تمت إضافة \`${theMember.username}\` للتذكرة**`).setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }).setFooter({ text: `طلب بواسطة: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })] });
          await interaction.channel.permissionOverwrites.edit(theMember.id, { ViewChannel: true, SendMessages: true });
        } else {
          await interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setDescription(`**عذرًا، لم أجد عضوًا بهذا الايدي \`${memberId}\`**`).setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }).setFooter({ text: `طلب بواسطة: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })], ephemeral: true });
        }
      } else if (interaction.customId === "removeMemberFromTicketSubmitModal") {
        const memberId = interaction.fields.getTextInputValue("removeMemberFromTicketMemberId");
        const theMember = await client27.users.fetch(memberId).catch(() => null);
        if (theMember) {
          await interaction.reply({ embeds: [new EmbedBuilder().setColor("Green").setDescription(`**تم حذف \`${theMember.username}\` من التذكرة**`).setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }).setFooter({ text: `طلب بواسطة: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })] });
          await interaction.channel.permissionOverwrites.edit(theMember.id, { ViewChannel: false, SendMessages: false });
        } else {
          await interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setDescription(`**عذرًا، لم أجد عضوًا بهذا الايدي \`${memberId}\`**`).setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }).setFooter({ text: `طلب بواسطة: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })], ephemeral: true });
        }
      }
    }
  });
};
