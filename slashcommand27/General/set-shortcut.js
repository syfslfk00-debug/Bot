const { SlashCommandBuilder } = require("discord.js");
const { getGuildShortcuts, saveGuildShortcuts } = require("../../utils/shortcutUtils");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-shortcut')
        .setDescription('إدارة اختصارات نصية عامة لكل الأوامر')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('تحديد أو تعديل اختصار لأمر')
                .addStringOption(option =>
                    option
                        .setName('command')
                        .setDescription('اسم الأمر بدون /')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName('shortcut')
                        .setDescription('الاختصار النصي')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('حذف اختصار أمر')
                .addStringOption(option =>
                    option
                        .setName('command')
                        .setDescription('اسم الأمر بدون /')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('عرض جميع الاختصارات')
        ),
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused().toLowerCase();
        const commands = Array.from(interaction.client.CookiesSlashCommands?.keys?.() || [])
            .filter((name) => name.toLowerCase().includes(focused))
            .sort()
            .slice(0, 25)
            .map((name) => ({ name: `/${name}`, value: name }));
        await interaction.respond(commands);
    },
    async execute(interaction) {
        try {
            let subcommand = 'set';
            if (typeof interaction.options.getSubcommand === 'function') {
                try { subcommand = interaction.options.getSubcommand(); } catch { subcommand = 'set'; }
            }
            const shortcuts = await getGuildShortcuts(interaction.guild.id);

            if (subcommand === 'list') {
                const entries = Object.entries(shortcuts);
                if (!entries.length) return interaction.reply({ content: '**لا توجد اختصارات مسجلة لهذا السيرفر.**', ephemeral: true });
                return interaction.reply({
                    content: entries.map(([command, shortcut]) => `• \`/${command}\` ← \`${shortcut}\``).join('\n'),
                    ephemeral: true,
                });
            }

            const command = interaction.options.getString('command')?.replace(/^\//, '').trim();
            const exists = interaction.client.CookiesSlashCommands?.has(command);
            if (!exists) {
                return interaction.reply({ content: `❌ الأمر \`/${command}\` غير موجود ضمن أوامر البوت المسجلة.`, ephemeral: true });
            }

            if (subcommand === 'remove') {
                delete shortcuts[command];
                await saveGuildShortcuts(interaction.guild.id, shortcuts);
                return interaction.reply({ content: `✅ تم حذف اختصار الأمر \`/${command}\` بنجاح.`, ephemeral: true });
            }

            const shortcut = interaction.options.getString('shortcut')?.trim();
            if (!shortcut) return interaction.reply({ content: '❌ يجب كتابة اختصار صحيح.', ephemeral: true });

            shortcuts[command] = shortcut;
            await saveGuildShortcuts(interaction.guild.id, shortcuts);

            return interaction.reply({ content: `**تم تحديد اختصار للأمر \`/${command}\` بنجاح: \`${shortcut}\`**`, ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `حدث خطأ ما، حاول مرة أخرى.`, ephemeral: true });
        }
    }
};
