const { SlashCommandBuilder } = require('@discordjs/builders');
const keyValueService = require("../../services/keyValueService");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('line-mode')
        .setDescription('اختر بين إرسال صورة أو رابط')
        .addStringOption(option => 
            option.setName('mode')
            .setDescription('اختر بين الصورة والرابط')
            .setRequired(true)
            .addChoices(
                { name: 'صورة', value: 'image' },
                { name: 'رابط', value: 'link' },
            )),
    async execute(interaction) {
        const mode = interaction.options.getString('mode');
        await keyValueService.set('autolineDB', `line_mode_${interaction.guild.id}`, mode);
        await interaction.reply({ content: `تم ضبط وضع الإرسال إلى ${mode}`, ephemeral: true });
    },
};
