const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
    .setName('set-feedback-room')
    .setDescription('تحديد روم الاراء')
    .addChannelOption(Option => 
        Option
        .setName('room')
        .setDescription('الروم')
        .setRequired(true)), // or false
async execute(interaction) {
    try{
    const room = interaction.options.getChannel(`room`)
    await keyValueService.set('feedbackDB', `feedback_room_${interaction.guild.id}` , room.id)
    return interaction.reply({content:`**تم تحديد الروم بنجاح**`})
} catch  {
    return;
}
}
}