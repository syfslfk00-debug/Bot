const { ChatInputCommandInteraction, Client, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getGuildReplies, saveGuildReplies } = require("../../utils/autoReplyUtils");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('autoreply-edit')
        .setDescription('تعديل رد تلقائي موجود')
        .addStringOption(option => option
            .setName('trigger')
            .setDescription('كلمة الرد المراد تعديله')
            .setRequired(true))
        .addStringOption(option => option
            .setName('reply')
            .setDescription('الرد النصي الجديد')
            .setRequired(false))
        .addStringOption(option => option
            .setName('match_type')
            .setDescription('نوع المطابقة الجديد')
            .setRequired(false)
            .addChoices(
                { name: 'مطابق تمامًا', value: 'exact' },
                { name: 'يحتوي على النص', value: 'contains' },
                { name: 'يبدأ بـ', value: 'startsWith' },
                { name: 'تعبير نمطي', value: 'regex' }
            )),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        const trigger = interaction.options.getString('trigger');
        const newReply = interaction.options.getString('reply');
        const matchType = interaction.options.getString('match_type');
        const replies = await getGuildReplies(interaction.guild.id);
        const index = replies.findIndex((r) => (r.trigger || r.word) === trigger);
        if (index === -1) return interaction.editReply({ content: `❌ لا يوجد رد تلقائي بهذه الكلمة \`${trigger}\`.` });

        if (newReply !== null) {
            replies[index].reply = newReply;
            if (replies[index].mode !== 'embed') replies[index].mode = 'text';
        }
        if (matchType) replies[index].type = matchType;
        replies[index].updatedBy = interaction.user.id;
        replies[index].updatedAt = new Date().toISOString();
        await saveGuildReplies(interaction.guild.id, replies);

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`✅ تم تعديل الرد التلقائي \`${trigger}\` بنجاح.`);
        return interaction.editReply({ embeds: [embed] });
    }
};
