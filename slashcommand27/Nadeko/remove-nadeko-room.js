const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
    .setName('remove-nadeko-room')
    .setDescription('ازالة روم مفعل الخاصية فيها')
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
if(!rooms.includes(room.id)) {
    return interaction.editReply({content:`**لم يتم اضافة هذه الروم من قبل لكي يتم الحذف**`})
}
const filtered = await rooms.filter(ro => ro != room.id)
await keyValueService.set('nadekoDB', `rooms_${interaction.guild.id}` , filtered)
return interaction.editReply({content:`**تم ازالة الروم بنجاح**`})

}
}