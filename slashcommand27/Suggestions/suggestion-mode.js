const { SlashCommandBuilder } = require('@discordjs/builders');
const keyValueService = require("../../services/keyValueService");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('suggestion-mode')
        .setDescription('أزرار أو رياكشنات')
        .addStringOption(option => 
            option.setName('mode')
            .setDescription('اختر مابين الأزرار أو الرياكشنز')
            .setRequired(true)
            .addChoices(
                { name: 'أزرار', value: 'buttons' },
                { name: 'رياكشنات', value: 'reactions' },
            ))
        .addStringOption(option => 
            option.setName('thread')
            .setDescription('انشاء ثريد للمناقشة')
            .setRequired(false)
            .addChoices(
                { name: 'تفعيل', value: 'enabled' },
                { name: 'تعطيل', value: 'disabled' },
            )),
    async execute(interaction) {
        const mode = interaction.options.getString('mode');
        const threadMode = interaction.options.getString('thread');

        await keyValueService.set('suggestionsDB', `suggestion_mode_${interaction.guild.id}`, mode);

        if (threadMode) {
            await keyValueService.set('suggestionsDB', `thread_mode_${interaction.guild.id}`, threadMode);
        }

        await interaction.reply({
            content: `تم ضبط وضع الاقتراحات على ${mode}`,
            ephemeral: true
        });
    },
};
