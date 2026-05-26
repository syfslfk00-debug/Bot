const { SlashCommandBuilder, EmbedBuilder ,ButtonStyle, PermissionsBitField, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
    .setName('set-tax-room')
    .setDescription('تحديد روم الضريبة التلقائية')
    .addChannelOption(Option => 
        Option
        .setName('room')
        .setDescription('الروم')
        .setRequired(true)), // or false
async execute(interaction) {
    let room = interaction.options.getChannel(`room`)
    await keyValueService.set('taxDB', `tax_room_${interaction.guild.id}` , room.id)
  
    return interaction.reply({content:`**تم تحديد الروم ${room} بنجاح**`})
}
}