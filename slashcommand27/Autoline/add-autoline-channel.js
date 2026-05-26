const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
    .setName('add-autoline-channel')
    .setDescription('اضافة روم خط تلقائي')
    .addChannelOption(Option => 
        Option
        .setName('room')
        .setDescription('الروم')
        .setRequired(true)), // or false
async execute(interaction) {
    const room = interaction.options.getChannel(`room`)
    if(!await keyValueService.has('autolineDB', `line_channels_${interaction.guild.id}`)) {
        await keyValueService.set('autolineDB', `line_channels_${interaction.guild.id}` , [])
    }
    await keyValueService.push('autolineDB', `line_channels_${interaction.guild.id}` , room.id)
    return interaction.reply({content:`**تم اضافة الروم بنجاح**`})
}
}