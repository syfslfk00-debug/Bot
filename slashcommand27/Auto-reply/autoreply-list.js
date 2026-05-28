const { ChatInputCommandInteraction, Client, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getGuildReplies } = require("../../utils/autoReplyUtils");

function typeLabel(type) {
    return {
        exact: "مطابق تمامًا",
        contains: "يحتوي على النص",
        startsWith: "يبدأ بـ",
        regex: "تعبير نمطي",
    }[type] || "مطابق تمامًا";
}

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('autoreply-list')
        .setDescription('عرض جميع الردود التلقائية'),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const data = await getGuildReplies(interaction.guild.id);
            if (data.length > 0) {
                const embed = new EmbedBuilder()
                    .setTitle('جميع الردود التلقائية')
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
                    .setFooter({ text: `طلب بواسطة: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

                data.slice(0, 25).forEach((d, index) => {
                    const trigger = d.trigger || d.word;
                    const reply = d.mode === "embed" ? (d.embed?.description || d.reply || "إيمبد") : (d.reply || "بدون رد نصي");
                    embed.addFields({
                        name: `${index + 1}. الكلمة: \`${trigger}\``,
                        value: `**نوع المطابقة:** ${typeLabel(d.type)}\n**نوع الرد:** ${d.mode === "embed" ? "إيمبد" : "نصي"}\n**الرد:** ${String(reply).slice(0, 900)}`,
                    });
                });
                embed.addFields({ name: `\n`, value: `\`\`\`يوجد ${data.length} ردود في السيرفر\`\`\`` });
                return interaction.editReply({ embeds: [embed] });
            }
            return interaction.editReply({ content: `**لا توجد أي ردود تلقائية مسجلة لهذا السيرفر.**` });
        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: `**لقد حدث خطأ، حاول مرة أخرى.**` });
        }
    }
};
