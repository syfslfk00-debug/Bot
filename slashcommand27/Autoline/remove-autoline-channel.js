const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
    .setName('remove-autoline-channel')
    .setDescription('ازالة روم خط تلقائي')
    .addChannelOption(Option => 
        Option
        .setName('room')
        .setDescription('الروم')
        .setRequired(true)), // or false
async execute(interaction) {
    const room = interaction.options.getChannel(`room`)
    
    let db = await keyValueService.get('autolineDB', `line_channels_${interaction.guild.id}`)
    if(!await keyValueService.has('autolineDB', `line_channels_${interaction.guild.id}`)) {
        await keyValueService.set('autolineDB', `line_channels_${interaction.guild.id}` , [])
    }
    db = await keyValueService.get('autolineDB', `line_channels_${interaction.guild.id}`)
    const filtered = db.filter(ch => ch != room.id)
    
    await keyValueService.set('autolineDB', `line_channels_${interaction.guild.id}` , filtered)
    return interaction.reply({content:`**تم ازالة الروم بنجاح**`})
}
}