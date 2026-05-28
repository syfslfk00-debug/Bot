const { SlashCommandBuilder } = require("discord.js");
const { buildMainHelpEmbed, buildHelpButtons } = require("../../utils/helpUtils");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('قائمة أوامر البوت'),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            await interaction.editReply({
                embeds: [await buildMainHelpEmbed(interaction, interaction.client)],
                components: buildHelpButtons(interaction.client),
            });
        } catch (error) {
            console.log("🔴 | خطأ في أمر help", error);
        }
    }
};
