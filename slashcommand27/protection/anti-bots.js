const { SlashCommandBuilder, EmbedBuilder ,ButtonStyle, PermissionsBitField, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    ownersOnly:true,
    data: new SlashCommandBuilder()
    .setName('anti-bots')
    .setDescription('تسطيب نظام الحماية من البوتات')
    .addStringOption(Option => Option
        .setName(`status`)
        .setDescription(`الحالة`)
        .setRequired(true)
        .addChoices(
            {
                name:`On` , value:`on`
            },
            {
                name:`Off` , value:`of`
            }
        ))
   , // or false
async execute(interaction) {
    await interaction.deferReply({ephemeral:false})
    try {
      const status = interaction.options.getString(`status`)
      await keyValueService.set('protectDB', `antibots_status_${interaction.guild.id}` , status)
     return interaction.editReply({content:`**تم بنجاح تعيين الحالة \n - تاكد من رفع رتبتي لاعلى رتبة في السيرفر**`})
    } catch {
    }
}
}