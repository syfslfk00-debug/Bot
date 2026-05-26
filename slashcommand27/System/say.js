const { Client, Collection,PermissionsBitField,SlashCommandBuilder, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    ownersOnly:false,
    data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('قول كلام')
    .addStringOption(Option => Option
        .setName(`sentence`)
        .setDescription(`الجملة`)
        .setRequired(true)),
async execute(interaction) {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({content:`**لا تمتلك صلاحية لفعل ذلك**` , ephemeral:true})
    const sentence = interaction.options.getString(`sentence`);
    await interaction.channel.send({content:`${sentence}`})
    return interaction.reply({content:`**Done**` , ephemeral:true}).then(async(msg) => {
        setTimeout(() => {
            msg.delete();
        }, 1.5 * 1000);
    })
}
}