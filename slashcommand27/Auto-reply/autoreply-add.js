const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require("discord.js");
const { getGuildReplies, saveGuildReplies, buildAutoReplyPayload, normalizeReplies } = require("../../utils/autoReplyUtils");

const matchTypes = [
    { label: "مطابق تمامًا", value: "exact" },
    { label: "يحتوي على النص", value: "contains" },
    { label: "يبدأ بـ", value: "startsWith" },
    { label: "تعبير نمطي", value: "regex" },
];

function buildPreviewEmbed(settings) {
    const embed = new EmbedBuilder()
        .setColor(settings.embed.color || "Random")
        .setTitle("معاينة الرد التلقائي")
        .addFields(
            { name: "الكلمة", value: settings.trigger || "غير محدد", inline: true },
            { name: "نوع المطابقة", value: matchTypes.find(t => t.value === settings.type)?.label || "مطابق تمامًا", inline: true },
            { name: "نوع الرد", value: settings.mode === "embed" ? "إيمبد" : "نصي", inline: true }
        );
    if (settings.mode === "embed") {
        embed.addFields(
            { name: "عنوان الإيمبد", value: settings.embed.title || "بدون عنوان", inline: false },
            { name: "وصف الإيمبد", value: settings.embed.description || settings.reply || "بدون وصف", inline: false }
        );
    } else {
        embed.addFields({ name: "الرد", value: settings.reply || "غير محدد", inline: false });
    }
    if (settings.button.label && settings.button.url) embed.addFields({ name: "الزر", value: `[${settings.button.label}](${settings.button.url})`, inline: false });
    return embed;
}

function mainButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("ar_basic").setLabel("⚙️ الأساسيات").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("ar_embed").setLabel("🧩 الإيمبد").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("ar_button").setLabel("🔗 الزر").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("ar_save").setLabel("💾 حفظ").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("ar_cancel").setLabel("❌ إلغاء").setStyle(ButtonStyle.Danger)
    );
}

async function askModal(componentInteraction, customId, title, inputs) {
    const modal = new ModalBuilder().setCustomId(customId).setTitle(title);
    for (const input of inputs) {
        modal.addComponents(new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId(input.id)
                .setLabel(input.label)
                .setStyle(input.style || TextInputStyle.Short)
                .setRequired(Boolean(input.required))
                .setValue(input.value || "")
        ));
    }
    await componentInteraction.showModal(modal);
}

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('autoreply-add')
        .setDescription('إضافة أو تعديل رد تلقائي تفاعلي متطور'),
    async execute(interaction) {
        try {
            const settings = {
                trigger: "",
                word: "",
                type: "exact",
                mode: "text",
                reply: "",
                embed: { title: "", description: "", color: "#5865F2", image: "", thumbnail: "" },
                button: { label: "", url: "" },
                addedBy: interaction.user.id,
                updatedAt: new Date().toISOString(),
            };

            await interaction.reply({ embeds: [buildPreviewEmbed(settings)], components: [mainButtons()], fetchReply: true, ephemeral: true });
            const filter = (i) => i.user.id === interaction.user.id;

            while (true) {
                const component = await interaction.channel.awaitMessageComponent({ filter, time: 900000 }).catch(() => null);
                if (!component) {
                    return interaction.editReply({ content: "⏰ انتهت مهلة إعداد الرد التلقائي.", embeds: [], components: [] });
                }

                if (component.customId === "ar_cancel") {
                    await component.deferUpdate();
                    return interaction.editReply({ content: "❌ تم إلغاء الإعداد.", embeds: [], components: [] });
                }

                if (component.customId === "ar_basic") {
                    await askModal(component, "ar_modal_basic", "إعدادات الرد الأساسية", [
                        { id: "trigger", label: "الكلمة", required: true, value: settings.trigger },
                        { id: "reply", label: "الرد النصي / وصف افتراضي", style: TextInputStyle.Paragraph, required: false, value: settings.reply },
                    ]);
                    const modal = await component.awaitModalSubmit({ filter, time: 120000 }).catch(() => null);
                    if (!modal) continue;
                    settings.trigger = modal.fields.getTextInputValue("trigger").trim();
                    settings.word = settings.trigger;
                    settings.reply = modal.fields.getTextInputValue("reply");
                    const select = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId("ar_match_type")
                            .setPlaceholder("اختر نوع المطابقة")
                            .addOptions(matchTypes)
                    );
                    await modal.update({ embeds: [buildPreviewEmbed(settings)], components: [select, mainButtons()] });
                    continue;
                }

                if (component.customId === "ar_embed") {
                    await askModal(component, "ar_modal_embed", "إعدادات الإيمبد", [
                        { id: "title", label: "عنوان الإيمبد", required: false, value: settings.embed.title },
                        { id: "description", label: "وصف الإيمبد", style: TextInputStyle.Paragraph, required: false, value: settings.embed.description },
                        { id: "color", label: "اللون مثال #5865F2", required: false, value: settings.embed.color },
                        { id: "image", label: "رابط الصورة", required: false, value: settings.embed.image },
                        { id: "thumbnail", label: "رابط الصورة المصغرة", required: false, value: settings.embed.thumbnail },
                    ]);
                    const modal = await component.awaitModalSubmit({ filter, time: 120000 }).catch(() => null);
                    if (!modal) continue;
                    settings.mode = "embed";
                    settings.embed.title = modal.fields.getTextInputValue("title");
                    settings.embed.description = modal.fields.getTextInputValue("description");
                    settings.embed.color = modal.fields.getTextInputValue("color") || "#5865F2";
                    settings.embed.image = modal.fields.getTextInputValue("image");
                    settings.embed.thumbnail = modal.fields.getTextInputValue("thumbnail");
                    await modal.update({ embeds: [buildPreviewEmbed(settings)], components: [mainButtons()] });
                    continue;
                }

                if (component.customId === "ar_button") {
                    await askModal(component, "ar_modal_button", "زر داخل الرد", [
                        { id: "label", label: "نص الزر", required: false, value: settings.button.label },
                        { id: "url", label: "الرابط الخارجي", required: false, value: settings.button.url },
                    ]);
                    const modal = await component.awaitModalSubmit({ filter, time: 120000 }).catch(() => null);
                    if (!modal) continue;
                    settings.button.label = modal.fields.getTextInputValue("label");
                    settings.button.url = modal.fields.getTextInputValue("url");
                    await modal.update({ embeds: [buildPreviewEmbed(settings)], components: [mainButtons()] });
                    continue;
                }

                if (component.isStringSelectMenu() && component.customId === "ar_match_type") {
                    settings.type = component.values[0];
                    await component.update({ embeds: [buildPreviewEmbed(settings)], components: [mainButtons()] });
                    continue;
                }

                if (component.customId === "ar_save") {
                    await component.deferUpdate();
                    if (!settings.trigger) {
                        await interaction.followUp({ content: "❌ يجب تحديد الكلمة قبل الحفظ.", ephemeral: true });
                        continue;
                    }
                    const replies = normalizeReplies(await getGuildReplies(interaction.guild.id));
                    const index = replies.findIndex((r) => (r.trigger || r.word) === settings.trigger);
                    if (index >= 0) replies[index] = settings;
                    else replies.push(settings);
                    await saveGuildReplies(interaction.guild.id, replies);

                    const previewPayload = buildAutoReplyPayload(settings, interaction);
                    await interaction.followUp({ content: "✅ تمت معاينة الرد كما سيظهر:", ...previewPayload, ephemeral: true });
                    return interaction.editReply({ content: `✅ تم حفظ الرد التلقائي لـ \`${settings.trigger}\` بنجاح.`, embeds: [], components: [] });
                }
            }
        } catch (error) {
            console.error(error);
            if (interaction.deferred || interaction.replied) return interaction.editReply({ content: `**حدث خطأ أثناء إعداد الرد التلقائي.**`, embeds: [], components: [] });
            return interaction.reply({ content: `**حدث خطأ أثناء إعداد الرد التلقائي.**`, ephemeral: true });
        }
    }
};
