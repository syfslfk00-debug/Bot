const { SlashCommandBuilder } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('remove-token')
        .setDescription('إزالة توكن برودكاست')
        .addStringOption(option =>
            option
                .setName('token')
                .setDescription('التوكن')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const token = interaction.options.getString('token');
            const tokens = await keyValueService.get('BroadcastDB', `tokens_${interaction.guild.id}`) || [];

            if (!tokens.includes(token)) {
                return interaction.reply({ content: '**هذا التوكن غير موجود في السيرفر.**' });
            }

            await keyValueService.set('BroadcastDB', `tokens_${interaction.guild.id}`, tokens.filter(t => t !== token));
            return interaction.reply({ content: '**تم إزالة التوكن بنجاح!**' });
        } catch (error) {
            return interaction.reply({ content: `**حدث خطأ**` });
        }
    }
};
