const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
    .setName('set-message')
    .setDescription('تحديد الرسالة عند الدخول')
    .addStringOption(Option => Option
        .setName(`message`)
        .setDescription(`الرسالة`)
        .setRequired(true)), // or false
async execute(interaction) {
    await interaction.deferReply({ephemeral:false})
const message = interaction.options.getString(`message`)
await keyValueService.set('nadekoDB', `message_${interaction.guild.id}` , message)
return interaction.editReply({content:`**تم تحديد الرسالة بنجاح**`})

}
}