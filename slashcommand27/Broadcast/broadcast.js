const { SlashCommandBuilder, Client, ActivityType, EmbedBuilder } = require("discord.js");
const keyValueService = require("../../services/keyValueService");

async function sendBroadcast(interaction, mode, broadcastMsg) {
    await interaction.deferReply({ ephemeral: false });

    if (!interaction.member.permissions.has(require("discord.js").PermissionsBitField.Flags.Administrator)) {
        return interaction.editReply({ content: "❌ ليس لديك الصلاحيات اللازمة لاستخدام هذا الأمر." });
    }

    const thetokens = await keyValueService.get('BroadcastDB', `tokens_${interaction.guild.id}`) || [];
    const botsNum = thetokens.length;
    if (botsNum === 0) return interaction.editReply({ content: "لا يوجد بوتات برودكاست مضافة." });

    await interaction.guild.members.fetch();
    let allMembers = interaction.guild.members.cache.filter(member => !member.user.bot);

    if (mode === "online") {
        allMembers = allMembers.filter(mem =>
            mem.presence?.status === "online" ||
            mem.presence?.status === "dnd" ||
            mem.presence?.status === "idle" ||
            mem.presence?.activities.some(activity => activity.type === ActivityType.Streaming)
        );
    }

    allMembers = allMembers.map(mem => mem.user.id);
    if (!allMembers.length) return interaction.editReply({ content: "لا يوجد أعضاء مطابقون لنوع الإرسال المحدد." });

    const membersPerBot = Math.max(1, Math.ceil(allMembers.length / botsNum));
    const submembers = [];
    for (let i = 0; i < allMembers.length; i += membersPerBot) {
        submembers.push(allMembers.slice(i, i + membersPerBot));
    }

    let donemembers = 0;
    let faildmembers = 0;

    const buildEmbed = (title, color) => new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setDescription(`**⚫ عدد الأعضاء: \`${allMembers.length}\`\n🟢 تم الإرسال إلى: \`${donemembers}\`\n🔴 فشل الإرسال إلى: \`${faildmembers}\`**`);

    const msg = await interaction.editReply({ embeds: [buildEmbed("📢 بدء إرسال البرودكاست", "Aqua")] });

    for (let i = 0; i < submembers.length; i++) {
        const token = thetokens[i];
        if (!token) continue;
        const clienter = new Client({ intents: 131071 });
        try {
            await clienter.login(token);
            for (const sub of submembers[i]) {
                try {
                    const user = await clienter.users.fetch(sub);
                    await user.send(`${broadcastMsg}\n<@${sub}>`);
                    donemembers++;
                } catch {
                    faildmembers++;
                }
                await msg.edit({ embeds: [buildEmbed("📢 تحديث حالة البرودكاست", "Aqua")] }).catch(() => {});
            }
        } catch {
            faildmembers += submembers[i].length;
        } finally {
            clienter.destroy?.();
        }
    }

    return msg.edit({ embeds: [buildEmbed("✅ تم الانتهاء من إرسال البرودكاست", "Green")] }).catch(() => {});
}

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('broadcast')
        .setDescription('إرسال رسالة برودكاست للأعضاء')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('رسالة البرودكاست')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('نوع الإرسال')
                .setRequired(false)
                .addChoices(
                    { name: 'الجميع', value: 'all' },
                    { name: 'الأونلاين', value: 'online' }
                )
        ),
    async execute(interaction) {
        const broadcastMsg = interaction.options.getString('message');
        const mode = interaction.options.getString('type') || 'all';
        return sendBroadcast(interaction, mode, broadcastMsg);
    }
};
