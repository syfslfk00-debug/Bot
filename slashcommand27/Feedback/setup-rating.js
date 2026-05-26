const { SlashCommandBuilder } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('setup-rating')
        .setDescription('تسطيب اعدادات التقييم')
        .addRoleOption(option =>
            option
                .setName('staff-role')
                .setDescription('رتبة الادارة')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName('rank-room')
                .setDescription('الروم اللي تنرسل لها التقييمات')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const role = interaction.options.getRole('staff-role');
            const room = interaction.options.getChannel('rank-room');

            await keyValueService.set('feedbackDB', `staff_role_${interaction.guild.id}`, role.id);
            await keyValueService.set('feedbackDB', `rank_room_${interaction.guild.id}`, room.id);

            return interaction.reply({ content: '**تم تحديد الاعدادات بنجاح**' });
        } catch (error) {
            console.error('Error setting feedback config:', error);
            return interaction.reply({ content: 'حدث خطأ أثناء تحديد الإعدادات.', ephemeral: true });
        }
    }
};
