const { SlashCommandBuilder, EmbedBuilder ,ButtonStyle, PermissionsBitField, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
    .setName('send-broadcast-panel')
    .setDescription('ارسال بانل التحكم في البرودكاست'), // or false
async execute(interaction) {
    await interaction.deferReply({ephemeral:false})
    try {
        const broadcast_msg = await keyValueService.get('BroadcastDB', `broadcast_msg_${interaction.guild.id}`) ?? "لم يتم تحديد رسالة"
        const msgid = await keyValueService.get('BroadcastDB', `msgid_${interaction.guild.id}`)
        if(msgid) {
            let chan = interaction.guild.channels.cache.forEach(async(channel) => {
                try {
                    msg = channel.messages.fetch(msgid).then(async(msgg) => {
                         msgg.delete()
                     }).catch(async() => {return;})
                } catch {
                    
                }
            })
        }
        const tokens = await keyValueService.get('BroadcastDB', `tokens_${interaction.guild.id}`) ?? 0;
        const embed = new EmbedBuilder()
        .setTitle(`**التحكم في البرودكاست**`)
        .addFields(
            {
                name:`**عدد البوتات المسجلة حاليا**`,value:`**\`\`\`${tokens.length ?? 0} من البوتات\`\`\`**`,inline:false
            },
            {
                name:`**رسالة البرودكاست الحالية**`,value:`**\`\`\`${broadcast_msg}\`\`\`**`,inline:false
            },
        )
        .setDescription(`**يمكنك التحكم في البوت عن طريق الازرار**`)
        .setColor('Aqua')
        .setFooter({text:interaction.user.username , iconURL:interaction.user.displayAvatarURL({dynamic:true})})
        .setAuthor({name:interaction.guild.name , iconURL:interaction.guild.iconURL({dynamic:true})})
        .setTimestamp(Date.now())
        const add_token = new ButtonBuilder()
        .setCustomId(`add_token_button`)
        .setLabel(`اضافة توكن برودكاست`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false)
        .setEmoji(`🤖`)
        const broadcast_message = new ButtonBuilder()
        .setCustomId(`broadcast_message_button`)
        .setLabel(`تحديد رسالة البرودكاست`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(false)
        .setEmoji(`📡`)
        const start_broadcast = new ButtonBuilder()
        .setCustomId(`run_broadcast_button`)
        .setLabel(`بدأ ارسال البرودكاست`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(false)
        .setEmoji(`✅`)
        const row = new ActionRowBuilder()
        .addComponents(add_token,broadcast_message,start_broadcast)
        let newmsg = await interaction.editReply({embeds:[embed] , components:[row]})
        await keyValueService.set('BroadcastDB', `msgid_${interaction.guild.id}` , newmsg.id)
        return;
    } catch {
    }
}
}