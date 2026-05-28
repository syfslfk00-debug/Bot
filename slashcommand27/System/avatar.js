const { Client, Collection,SlashCommandBuilder, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    ownersOnly:false,
    data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('رؤية افاتارك او شخص اخر')
    .addUserOption(Option => Option
        .setName(`user`)
        .setDescription(`الشخص`)
        .setRequired(false)), // or false
async execute(interaction) {
    await interaction.deferReply({ephemeral:false})
    let user = interaction.options.getUser(`user`)
    if(!user) user = interaction.user
    const embed = new EmbedBuilder()
    .setAuthor({name:user.username , iconURL:user.displayAvatarURL({dynamic:true , size:1024})})
    .setTitle(`رابط الصورة الشخصية`)
    .setURL(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=1024`)
    .setImage(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=1024`)
    .setFooter({text:`طلب بواسطة: ` + interaction.user.username , iconURL:interaction.user.displayAvatarURL({dynamic:true})})
    return interaction.editReply({embeds:[embed]})
}
}