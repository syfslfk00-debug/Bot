const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
    .setName('add-nadeko-room')
    .setDescription('اضافة روم يتم تفعيل الخاصية فيها')
    .addChannelOption(Option => Option
        .setName(`room`)
        .setDescription(`الروم`)
        .setRequired(true)), // or false
async execute(interaction) {
    await interaction.deferReply({ephemeral:false})
const room = interaction.options.getChannel(`room`)
let rooms = await keyValueService.get('nadekoDB', `rooms_${interaction.guild.id}`)
if(!rooms) {
    await keyValueService.set('nadekoDB', `rooms_${interaction.guild.id}` , [])
}
rooms = await keyValueService.get('nadekoDB', `rooms_${interaction.guild.id}`)
await keyValueService.push('nadekoDB', `rooms_${interaction.guild.id}` , room.id)

return interaction.editReply({content:`**تم اضافة الروم بنجاح**`})

}
}