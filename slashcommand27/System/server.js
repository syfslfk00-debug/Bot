const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require("discord.js");

module.exports = {
    ownersOnly:false,
    data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('رؤية معلومات السيرفر'),
async execute(interaction) {
    await interaction.deferReply({ephemeral:false})
    const embed = new EmbedBuilder()
    .setAuthor({name:interaction.guild.name , iconURL:interaction.guild.iconURL({dynamic:true})})
    .setColor(`Random`)
    .addFields(
        {
            name:`**🆔 ايدي السيرفر:**` , value:interaction.guild.id , inline:false
        },
        {
            name:`**📆 تم إنشاؤه:**` , value:`**<t:${parseInt(interaction.guild.createdTimestamp / 1000)}:R>**` , inline:false
        },
        {
            name:`**👑 مالك السيرفر:**` , value:`**<@${interaction.guild.ownerId}>**` , inline:false
        },
        {
            name:`**👥 الأعضاء (${interaction.guild.memberCount})**` , value:`**${interaction.guild.premiumSubscriptionCount} بوست ✨**` , inline:false
        },
        {
            name:`**💬 الرومات (${interaction.guild.channels.cache.size})**` , value:`**${interaction.guild.channels.cache.filter((r) => r.type == ChannelType.GuildText).size}** كتابية | **${
                interaction.guild.channels.cache.filter((r) => r.type == ChannelType.GuildVoice).size
            }** صوتية | **${interaction.guild.channels.cache.filter((r) => r.type === ChannelType.GuildCategory).size}** تصنيف` , inline:false
       
        },
        {
            name: '🌍 معلومات أخرى',
            value: `**مستوى التحقق:** ${interaction.guild.verificationLevel}`,
            inline: false,
        },
    )
    .setThumbnail(interaction.guild.iconURL({dynamic:true}))
    return interaction.editReply({embeds:[embed]})
}
}
