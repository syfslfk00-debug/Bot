const { SlashCommandBuilder } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('remove-all-tokens')
        .setDescription('إزالة جميع بوتات البرودكاست'),
    async execute(interaction) {
        try {
            await keyValueService.delete('BroadcastDB', `tokens_${interaction.guild.id}`);
            return interaction.reply({ content: '**تم إزالة جميع التوكنات من السيرفر بنجاح!**' });
        } catch (error) {
            return interaction.reply({ content: `**حدث خطأ**` });
        }
    }
};
