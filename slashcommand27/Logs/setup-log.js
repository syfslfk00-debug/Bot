const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    ownersOnly:true,
    data: new SlashCommandBuilder()
    .setName('setup-logs')
    .setDescription('تسطيب نظام اللوج')
    .addChannelOption(Option => 
        Option
        .setName('messagedelete')
        .setDescription('روم لوج حذف الرسائل')
        .setRequired(false))
        .addChannelOption(Option => 
            Option
            .setName('messageupdate')
            .setDescription('روم لوج تعديل الرسائل')
            .setRequired(false))
            .addChannelOption(Option => 
                Option
                .setName('rolecreate')
                .setDescription('روم انشاء رتبة')
                .setRequired(false))
                .addChannelOption(Option => 
                    Option
                    .setName('roledelete')
                    .setDescription('روم حذف رتبة')
                    .setRequired(false))
                    .addChannelOption(Option => 
                        Option
                        .setName('rolegive')
                        .setDescription('روم اعطاء لشخص رتبة')
                        .setRequired(false))
                        .addChannelOption(Option => 
                            Option
                            .setName('roleremove')
                            .setDescription('روم سحب من شخص رتبة')
                            .setRequired(false))
                        .addChannelOption(Option => 
                            Option
                            .setName('channelcreate')
                            .setDescription('روم انشاء روم')
                            .setRequired(false))
                            .addChannelOption(Option => 
                                Option
                                .setName('channeldelete')
                                .setDescription('روم حذف روم')
                                .setRequired(false))
                                .addChannelOption(Option => 
                                    Option
                                    .setName('botadd')
                                    .setDescription('روم عند دخول بوت للسيرفر')
                                    .setRequired(false))
                                    .addChannelOption(Option => 
                                        Option
                                        .setName('banadd')
                                        .setDescription('روم عند اعطاء شخص بان')
                                        .setRequired(false))
                                        .addChannelOption(Option => 
                                            Option
                                            .setName('bandelete')
                                            .setDescription('روم عند فك بان شخص')
                                            .setRequired(false))
                                            .addChannelOption(Option => 
                                                Option
                                                .setName('kickadd')
                                                .setDescription('روم عند اعطاء شخص طرد')
                                                .setRequired(false)), // or false
async execute(interaction) {
    let messagedelete = interaction.options.getChannel(`messagedelete`)
            let messageupdate = interaction.options.getChannel(`messageupdate`)
            let rolecreate = interaction.options.getChannel(`rolecreate`)
            let roledelete = interaction.options.getChannel(`roledelete`)
            let rolegive = interaction.options.getChannel(`rolegive`)
            let roleremove = interaction.options.getChannel(`roleremove`)
            let channelcreate = interaction.options.getChannel(`channelcreate`)
            let channeldelete = interaction.options.getChannel(`channeldelete`)
            let botadd = interaction.options.getChannel(`botadd`)
            let banadd = interaction.options.getChannel(`banadd`)
            let bandelete = interaction.options.getChannel(`bandelete`)
            let kickadd = interaction.options.getChannel(`kickadd`)
            if(messagedelete) {
                await keyValueService.set('logsDB', `log_messagedelete_${interaction.guild.id}` , messagedelete.id)
            }
            if(messageupdate) {
                await keyValueService.set('logsDB', `log_messageupdate_${interaction.guild.id}` , messageupdate.id)
            }
            if(rolecreate) {
                await keyValueService.set('logsDB', `log_rolecreate_${interaction.guild.id}` , rolecreate.id)
            }
            if(roledelete) {
                await keyValueService.set('logsDB', `log_roledelete_${interaction.guild.id}` , roledelete.id)
            }
            if(rolegive) {
                await keyValueService.set('logsDB', `log_rolegive_${interaction.guild.id}` , rolegive.id)
            }
            if(roleremove) {
                await keyValueService.set('logsDB', `log_roleremove_${interaction.guild.id}` , roleremove.id)
            }
            if(channelcreate) {
                await keyValueService.set('logsDB', `log_channelcreate_${interaction.guild.id}` , channelcreate.id)
            }
            if(channeldelete) {
                await keyValueService.set('logsDB', `log_channeldelete_${interaction.guild.id}` , channeldelete.id)
            }
            if(botadd) {
                await keyValueService.set('logsDB', `log_botadd_${interaction.guild.id}` , botadd.id)
            }
            if(banadd) {
                await keyValueService.set('logsDB', `log_banadd_${interaction.guild.id}` , banadd.id)
            }
            if(bandelete) {
                await keyValueService.set('logsDB', `log_bandelete_${interaction.guild.id}` , bandelete.id)
            }
            if(kickadd) {
                await keyValueService.set('logsDB', `log_kickadd_${interaction.guild.id}` , kickadd.id)
            }
            return interaction.reply({content:`**تم تحديد الاعدادات بنجاح**`})
}
}