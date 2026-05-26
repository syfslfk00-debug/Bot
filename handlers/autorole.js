const keyValueService = require("../services/keyValueService");
const { 
  Events, ButtonBuilder, ActionRowBuilder, ButtonStyle 
} = require("discord.js");

module.exports = (client27) => {
  client27.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      const [prefix, guildId, roleId] = interaction.customId.split("_");

      if (prefix !== "getrole") return; 

      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) {
        return interaction.reply({
          content: `❌ **عذرًا، هذه الرتبة غير موجودة.**`,
          ephemeral: true,
        });
      }

      const member = interaction.member;

      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId);
        await interaction.reply({
          content: `🗑️ **تمت إزالة الرتبة ${role.name} منك.**`,
          ephemeral: true,
        });
      } else {
        await member.roles.add(roleId);
        await interaction.reply({
          content: `✅ **تم منحك الرتبة ${role.name}!**`,
          ephemeral: true,
        });
      }
    }
  });
};
