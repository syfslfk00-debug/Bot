const keyValueService = require("../services/keyValueService");

const {
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder,
    SlashCommandBuilder,
    Events,
    ActivityType,
    ModalBuilder,
    TextInputStyle,
    EmbedBuilder,
    PermissionsBitField,
    ButtonStyle,
    TextInputBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    MessageComponentCollector,
    Embed
} = require("discord.js");

module.exports = (client27) => {
    client27.on(Events.InteractionCreate, async (interaction) => {
        if ((interaction.isButton() || interaction.isStringSelectMenu()) && interaction.customId.startsWith('ticket')) {
            const customId = interaction.isStringSelectMenu() ? interaction.values[0] : interaction.customId;
            if (customId === 'reset') {
                return;
            }
            const data = await keyValueService.get('ticketDB', `Ticket_${interaction.channel.id}_${customId}`);
            if (!data) return interaction.reply({ content: `Please Setup Again`, ephemeral: true });

            if (data.Ask === 'on') {
                const modal = new ModalBuilder()
                    .setCustomId(customId + '_modal')
                    .setTitle('سبب فتح التذكرة')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('ticket_reason')
                                .setLabel('ما هو سبب فتح التكت')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );
                await interaction.showModal(modal);
            } else {
                createTicketChannel(interaction, data);
            }
        }

        if (interaction.isModalSubmit() && interaction.customId.endsWith('_modal')) {
            const buttonCustomId = interaction.customId.replace('_modal', '');
            const data = await keyValueService.get('ticketDB', `Ticket_${interaction.channel.id}_${buttonCustomId}`);
            if (!data) return interaction.reply({ content: `Please Setup Again`, ephemeral: true });

            const ticketReason = interaction.fields.getTextInputValue('ticket_reason');
            createTicketChannel(interaction, data, ticketReason);
        }

    });
};

async function createTicketChannel(interaction, data, ticketReason = null) {
    const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: 0,
        parent: data.Category,
        permissionOverwrites: [
            {
                id: interaction.guild.roles.everyone.id,
                deny: ['ViewChannel'],
            },
            {
                id: data.Support,
                allow: ['ViewChannel', 'SendMessages'],
            },
            {
                id: interaction.user.id,
                allow: ['ViewChannel', 'SendMessages'],
            },
        ],
    });

    await keyValueService.set('ticketDB', `TICKET-PANEL_${channel.id}`, { author: interaction.user.id, Support: data.Support });
    interaction.reply({ content: `${channel} has been created :white_check_mark:`, ephemeral: true });

    const mentionLine = `**${interaction.user} | <@&${data.Support}>**`;
    const welcomeMessage = data.Internal || '';

    let embedTitle = null;
    let embedDescription = '';
    let embedColor = 'Random';
    let embedImage = null;
    let useThumbnail = false;

    const templateMatch = welcomeMessage.match(/^\[template:(.+?)\]/);
    if (templateMatch) {
        const templateName = templateMatch[1].trim();
        const welcomeTemplates = await keyValueService.get('welcomeTemplates', interaction.guild.id) || {};
        const templateData = welcomeTemplates[templateName];

        if (templateData) {
            embedTitle = templateData.title || null;
            embedDescription = templateData.description || '';
            embedColor = templateData.color || 'Random';
            embedImage = templateData.image || null;
            useThumbnail = Boolean(templateData.thumbnail);
        } else {
            embedDescription = 'تعذر العثور على قالب الترحيب المحدد، تم استخدام الرسالة الافتراضية.';
        }
    } else {
        embedDescription = welcomeMessage;
    }

    const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setDescription(embedDescription)
        .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    if (embedTitle) embed.setTitle(embedTitle);
    if (embedImage) embed.setImage(embedImage);
    if (useThumbnail) embed.setThumbnail(interaction.guild.iconURL());

    const select = new StringSelectMenuBuilder()
        .setCustomId('supportPanel')
        .setPlaceholder('لوحة تحكم السبورت')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('تغيير اسم التكت')
                .setValue('renameTicket')
                .setEmoji('✍🏼'),
            new StringSelectMenuOptionBuilder()
                .setLabel('اضافة عضو للتذكرة')
                .setValue('addMemberToTicket')
                .setEmoji('✅'),
            new StringSelectMenuOptionBuilder()
                .setLabel('حذف عضو من التذكرة')
                .setValue('removeMemberFromTicket')
                .setEmoji('⛔'),
            new StringSelectMenuOptionBuilder()
                .setLabel('اعادة تحميل')
                .setValue('refreshSupportPanel')
                .setEmoji('🔄'),
        );

    const row2 = new ActionRowBuilder().addComponents(select);
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('close').setLabel('إغلاق').setEmoji('🔒').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('claim').setLabel('استلام').setEmoji('✅').setStyle(ButtonStyle.Success)
        );

    await channel.send({
        content: mentionLine,
        embeds: [embed],
        components: [row, row2]
    });

    if (ticketReason) {
        const reasonEmbed = new EmbedBuilder()
            .setColor('Random')
            .setDescription(`**سبب فتح التكت : \`\`\` ${ticketReason} \`\`\`**`)
            .setTimestamp();

        await channel.send({ embeds: [reasonEmbed] });
    }
}