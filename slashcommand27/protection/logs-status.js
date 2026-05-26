const { ChatInputCommandInteraction , Client , SlashCommandBuilder, EmbedBuilder ,ButtonStyle, PermissionsBitField, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    ownersOnly:true,
    data: new SlashCommandBuilder()
    .setName('protection-status')
    .setDescription('للاستعلام عن حالة نظام الحماية'), // or false
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
async execute(interaction , client) {
    await interaction.deferReply({ephemeral:false})
    try {
        const banStatus = await keyValueService.get('protectDB', `ban_status_${interaction.guild.id}`) || null;
        const banLimit = await keyValueService.get('protectDB', `ban_limit_${interaction.guild.id}`);

        const botsStatus = await keyValueService.get('protectDB', `antibots_status_${interaction.guild.id}`) || null;
        const botsLimit = "غير محدد"

        const delteRolesStatus = await keyValueService.get('protectDB', `antideleteroles_status_${interaction.guild.id}`) || null;
        const delteRolesLimit = await keyValueService.get('protectDB', `antideleteroles_limit_${interaction.guild.id}`) || "غير محدد"

        const deleteRoomsStatus = await keyValueService.get('protectDB', `antideleterooms_status_${interaction.guild.id}`) || null;
        const deleteRoomsLimit = await keyValueService.get('protectDB', `antideleterooms_limit_${interaction.guild.id}`) || "غير محدد"

        const embed = new EmbedBuilder()
                            .setTitle('حالة نظام الحماية')
                            .addFields(
                                {name : `الحماية من البوتات` , value : `الحالة : ${botsStatus == "on" ? "🟢" : "🔴"} \n العدد المسموح : \`${botsLimit}\``},
                                {name : `الحماية من الباند` , value : `الحالة : ${banStatus == "on" ? "🟢" : "🔴"} \n العدد المسموح : \`${banLimit >= 0 ? banLimit : "غير محدد"}\``},
                                {name : `الحماية من حذف الرومات` , value : `الحالة : ${deleteRoomsStatus == "on" ? "🟢" : "🔴"} \n العدد المسموح : \`${deleteRoomsLimit}\``},
                                {name : `الحماية من حذف الرتب` , value : `الحالة : ${delteRolesStatus == "on" ? "🟢" : "🔴"} \n العدد المسموح : \`${delteRolesLimit}\``}
                            )
        await interaction.editReply({embeds : [embed]})
    } catch {
    }
}
}