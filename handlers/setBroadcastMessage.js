const { SlashCommandBuilder,Events ,Client, ActivityType,ModalBuilder,TextInputStyle, EmbedBuilder , PermissionsBitField,ButtonStyle, TextInputBuilder, ActionRowBuilder,ButtonBuilder,MessageComponentCollector } = require("discord.js");
const keyValueService = require("../services/keyValueService");

module.exports = (client2) => {
    client2.on(Events.InteractionCreate , async(interaction) =>{
   if(interaction.isButton()) {
    if(interaction.customId == "broadcast_message_button") {
        try {
            const modal = new ModalBuilder()
            .setCustomId(`broadcast_message_modal`)
            .setTitle(`تحديد رسالة البرودكاست`)
            const tokenn = new TextInputBuilder()
            .setCustomId('the_message')
            .setLabel(`الرسالة`)
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(1)
            .setMaxLength(4000)
            const firstActionRow = new ActionRowBuilder().addComponents(tokenn);
            modal.addComponents(firstActionRow)
            await interaction.showModal(modal)
        } catch (error) {
            return interaction.reply({content:`${error.message}`})
        }
    }
}
if(interaction.isModalSubmit()) {
    if(interaction.customId == "broadcast_message_modal") {
        await interaction.deferReply({ephemeral:false})
        const themessage = interaction.fields.getTextInputValue(`the_message`)
        await keyValueService.set('BroadcastDB', `broadcast_msg_${interaction.guild.id}` , themessage);
        const broadcast_msg = await keyValueService.get('BroadcastDB', `broadcast_msg_${interaction.guild.id}`) ?? themessage;
        const msgid = await keyValueService.get('BroadcastDB', `msgid_${interaction.guild.id}`)
        tokens = await keyValueService.get('BroadcastDB', `tokens_${interaction.guild.id}`)
		if(!tokens) {
		await keyValueService.set('BroadcastDB', `tokens_${interaction.guild.id}` , [])
		}
		tokens = await keyValueService.get('BroadcastDB', `tokens_${interaction.guild.id}`)
        if(msgid) {
            const msg = interaction.channel.messages.fetch(msgid).then(async(msgg) => {
                const embed2 = new EmbedBuilder()
                .setTitle(`**التحكم في البرودكاست**`)
                .addFields(
                    {
                        name:`**عدد البوتات المسجلة حاليا**`,value:`**\`\`\`${tokens.length ?? "فشل التحديد"} من البوتات\`\`\`**`,inline:false
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
                msgg.edit({embeds:[embed2]})
            })
        }
       return interaction.editReply({content:`**تم تحديد الرسالة بنجاح**`})
    }
}
  }
    )};