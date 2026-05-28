const { Client, Collection,PermissionsBitField,SlashCommandBuilder, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    ownersOnly:false,
    data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('فتح الروم'), // or false
async execute(interaction) {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({content:`**لا تمتلك صلاحية لفعل ذلك**` , ephemeral:true})
    await interaction.deferReply({ephemeral:false})
    interaction.channel.permissionOverwrites.edit(interaction.channel.guild.roles.everyone, { SendMessages: true });
              return interaction.editReply({content:`**تم فتح ${interaction.channel}**`})
}
}