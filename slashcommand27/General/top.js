const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require("discord.js");

const {
    getTextScores,
    getVoiceScores,
    getTopEntries,
    formatVoiceDuration
} = require("../../utils/activityUtils");

const MEDALS = {
    1: "🥇",
    2: "🥈",
    3: "🥉"
};

function formatNumber(num) {
    return new Intl.NumberFormat("en-US").format(num);
}

function getRankEmoji(index) {
    return MEDALS[index + 1] || "•";
}

function buildTextLeaderboard(entries) {
    if (!entries.length) {
        return "```yaml\nلا توجد بيانات نشاط كتابي حتى الآن.\n```";
    }

    return entries.map(([userId, count], index) => {
        const emoji = getRankEmoji(index);

        return [
            `${emoji} ${index + 1}. <@${userId}>`,
            `┖ \`${formatNumber(count)}\` رسالة`
        ].join("\n");
    }).join("\n\n");
}

function buildVoiceLeaderboard(entries) {
    if (!entries.length) {
        return "```yaml\nلا توجد بيانات نشاط صوتي حتى الآن.\n```";
    }

    return entries.map(([userId, duration], index) => {
        const emoji = getRankEmoji(index);

        return [
            `${emoji} ${index + 1}. <@${userId}>`,
            `┖ \`${formatVoiceDuration(duration)}\``
        ].join("\n");
    }).join("\n\n");
}

function getUserRank(data, userId) {
    const sorted = Object.entries(data)
        .sort((a, b) => b[1] - a[1]);

    const index = sorted.findIndex(([id]) => id === userId);

    if (index === -1) return null;

    return {
        position: index + 1,
        value: sorted[index][1]
    };
}

module.exports = {
    ownersOnly: false,

    data: new SlashCommandBuilder()
        .setName("top")
        .setDescription("عرض قائمة التوب للنشاط الكتابي والصوتي"),

    async execute(interaction) {

        await interaction.deferReply();

        const guild = interaction.guild;

        const textScores = await getTextScores(guild.id);
        const voiceScores = await getVoiceScores(guild.id);

        const topText = getTopEntries(textScores, 10);
        const topVoice = getTopEntries(voiceScores, 10);

        const textRank = getUserRank(textScores, interaction.user.id);
        const voiceRank = getUserRank(voiceScores, interaction.user.id);

        const createEmbed = (type) => {

            const isText = type === "text";

            const embed = new EmbedBuilder()
                .setColor("#2B2D31")
                .setAuthor({
                    name: `${guild.name} • نظام التوب`,
                    iconURL: guild.iconURL({ dynamic: true })
                })
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setTimestamp();

            if (isText) {

                embed
                    .setTitle("🏆 توب النشاط الكتابي")
                    .setDescription(buildTextLeaderboard(topText))
                    .addFields({
                        name: "📍 ترتيبك الحالي",
                        value: textRank
                            ? `#${textRank.position} — \`${formatNumber(textRank.value)}\` رسالة`
                            : "ليس لديك نشاط كتابي بعد."
                    });

            } else {

                embed
                    .setTitle("🎤 توب النشاط الصوتي")
                    .setDescription(buildVoiceLeaderboard(topVoice))
                    .addFields({
                        name: "📍 ترتيبك الحالي",
                        value: voiceRank
                            ? `#${voiceRank.position} — \`${formatVoiceDuration(voiceRank.value)}\``
                            : "ليس لديك نشاط صوتي بعد."
                    });

            }

            embed.setFooter({
                text: `طلب بواسطة ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            });

            return embed;
        };

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("top_text")
                    .setLabel("التوب الكتابي")
                    .setEmoji("📝")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("top_voice")
                    .setLabel("التوب الصوتي")
                    .setEmoji("🎤")
                    .setStyle(ButtonStyle.Secondary)
            );

        const message = await interaction.editReply({
            embeds: [createEmbed("text")],
            components: [buttons]
        });

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 120000
        });

        collector.on("collect", async (btn) => {

            if (btn.user.id !== interaction.user.id) {
                return btn.reply({
                    content: "لا يمكنك التحكم بهذه القائمة.",
                    ephemeral: true
                });
            }

            if (btn.customId === "top_text") {

                await btn.update({
                    embeds: [createEmbed("text")],
                    components: [buttons]
                });

            }

            if (btn.customId === "top_voice") {

                await btn.update({
                    embeds: [createEmbed("voice")],
                    components: [buttons]
                });

            }

        });

        collector.on("end", async () => {

            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    ButtonBuilder.from(buttons.components[0]).setDisabled(true),
                    ButtonBuilder.from(buttons.components[1]).setDisabled(true)
                );

            await interaction.editReply({
                components: [disabledRow]
            }).catch(() => {});
        });

    }
};
`