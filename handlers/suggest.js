const { SlashCommandBuilder,Events ,Client, ActivityType,ModalBuilder,TextInputStyle, EmbedBuilder , PermissionsBitField,ButtonStyle, TextInputBuilder, ActionRowBuilder,ButtonBuilder,MessageComponentCollector } = require("discord.js");
const keyValueService = require("../services/keyValueService");

module.exports = (client27) => {
  client27.on(Events.InteractionCreate , async(interaction) =>{
    if(interaction.isButton()) {
        if(interaction.customId == "ok_button") {
            const themsg = interaction.message;
            if(await keyValueService.has('suggestionsDB', `${themsg.id}_${interaction.user.id}_voted`)) return interaction.reply({content:`**لقد قمت بالتصويت مرة بالفعل**` , ephemeral:true})
            let oks = await keyValueService.get('suggestionsDB', `${themsg.id}_ok`)
            let nos = await keyValueService.get('suggestionsDB', `${themsg.id}_no`)
            oks = oks + 1
            const button1 = new ButtonBuilder()
    .setCustomId(`ok_button`)
    .setLabel(`${oks}`)
    .setEmoji("✔️")
    .setStyle(ButtonStyle.Success)
    const button2 = new ButtonBuilder()
    .setCustomId(`no_button`)
    .setLabel(`${nos}`)
    .setEmoji("✖️")
    .setStyle(ButtonStyle.Danger)
    const row = new ActionRowBuilder().addComponents(button1 , button2)
    await keyValueService.set('suggestionsDB', `${themsg.id}_ok` , oks)
    await interaction.reply({content:`**شكرا لتصويتك**` , ephemeral:true})
    await keyValueService.set('suggestionsDB', `${themsg.id}_${interaction.user.id}_voted` , true)
    return interaction.message.edit({components:[row]})
        }
        if(interaction.customId == "no_button") {
            const themsg = interaction.message;
        if(await keyValueService.has('suggestionsDB', `${themsg.id}_${interaction.user.id}_voted`)) return interaction.reply({content:`**لقد قمت بالتصويت مرة بالفعل**` , ephemeral:true})
            let oks = await keyValueService.get('suggestionsDB', `${themsg.id}_ok`)
            let nos = await keyValueService.get('suggestionsDB', `${themsg.id}_no`)
            nos = nos + 1
            const button1 = new ButtonBuilder()
    .setCustomId(`ok_button`)
    .setLabel(`${oks}`)
    .setEmoji("✔️")
    .setStyle(ButtonStyle.Success)
    const button2 = new ButtonBuilder()
    .setCustomId(`no_button`)
    .setLabel(`${nos}`)
    .setEmoji("✖️")
    .setStyle(ButtonStyle.Danger)
    const row = new ActionRowBuilder().addComponents(button1 , button2)
    await keyValueService.set('suggestionsDB', `${themsg.id}_no` , nos)
    await interaction.reply({content:`**شكرا لتصويتك**` , ephemeral:true})
    await keyValueService.set('suggestionsDB', `${themsg.id}_${interaction.user.id}_voted` , true)
    return interaction.message.edit({components:[row]})
        }
    }
  }
  )};