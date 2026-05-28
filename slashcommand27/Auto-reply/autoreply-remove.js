const { ChatInputCommandInteraction, Client, SlashCommandBuilder } = require("discord.js");
const { getGuildReplies, saveGuildReplies } = require("../../utils/autoReplyUtils");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('autoreply-remove')
        .setDescription('حذف رد تلقائي')
        .addStringOption(Option => Option
            .setName(`trigger`)
            .setDescription(`كلمة الرد التلقائي`)
            .setRequired(true)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const trigger = interaction.options.getString(`trigger`);
            const replies = await getGuildReplies(interaction.guild.id);
            const data = replies.find((r) => (r.trigger || r.word) === trigger);
            if (data) {
                const filtered = replies.filter((r) => (r.trigger || r.word) !== trigger);
                await saveGuildReplies(interaction.guild.id, filtered);
                return interaction.editReply({ content: `**تم حذف الرد التلقائي \`${trigger}\`**` });
            }
            return interaction.editReply({ content: `**لا يوجد رد بهذه الكلمة \`${trigger}\`**` });
        } catch (error) {
            console.error(error);
            return interaction.editReply({ content: `**لقد حدث خطأ، حاول مرة أخرى.**` });
        }
    }
};
