const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const keyValueService = require("../../services/keyValueService");

module.exports = {
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName("to-select")
    .setDescription("تحويل أزرار رسالة إلى قائمة منسدلة مع دعم قوالب الترحيب"),

  async execute(interaction) {
    // ============ الخطوة 1: طلب message_id عبر نافذة منبثقة ============
    const idModal = new ModalBuilder()
      .setCustomId("modal_message_id")
      .setTitle("أدخل معرف الرسالة");

    const idInput = new TextInputBuilder()
      .setCustomId("message_id")
      .setLabel("Message ID")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    idModal.addComponents(new ActionRowBuilder().addComponents(idInput));
    await interaction.showModal(idModal);

    let message;
    let buttonComponents = [];

    try {
      const modalSubmit = await interaction.awaitModalSubmit({ time: 120_000 });
      const messageId = modalSubmit.fields.getTextInputValue("message_id").trim();

      // جلب الرسالة
      message = await interaction.channel.messages.fetch(messageId);

      // البحث عن صف يحتوي على أزرار
      const buttonRow = message.components.find((row) =>
        row.components.some((comp) => comp.type === 2)
      );

      if (!buttonRow) {
        await modalSubmit.reply({
          content: "❌ لا توجد أزرار في هذه الرسالة.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      buttonComponents = buttonRow.components.filter((comp) => comp.type === 2);

      // نخزن مؤقتاً بيانات الأزرار لتعديلها
      // سنبني قائمة منسدلة للخيارات الحالية
      await modalSubmit.deferUpdate();
    } catch (err) {
      console.error(err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.followUp({
          content: "❌ حدث خطأ أثناء جلب الرسالة. تأكد من صحة المعرف وأنك في نفس القناة.",
          flags: MessageFlags.Ephemeral,
        }).catch(() => {});
      }
      return;
    }

    // ============ الخطوة 2: معالج إعداد الأوصاف / قوالب الترحيب ============
    // إعدادات مؤقتة لكل زر: { customId, label, emoji, description, welcomeTemplate }
    const buttonsConfig = buttonComponents.map((btn) => ({
      customId: btn.customId,
      label: btn.label,
      emoji: btn.emoji ? btn.emoji.id || btn.emoji.name : null,
      description: null,         // وصف القائمة المنسدلة
      welcomeTemplate: null,     // اسم قالب الترحيب المختار (أو null)
      welcomeMessage: null,      // نص ترحيب مخصص (في حال عدم اختيار قالب)
    }));

    // جلب قوالب الترحيب من قاعدة البيانات
    const welcomeTemplates =
      (await keyValueService.get("welcomeTemplates", interaction.guild.id)) || {};

    // دالة بناء قائمة الأزرار الحالية كقائمة منسدلة (لاختيار زر لتعديله)
    const buildButtonsSelect = () => {
      const options = buttonsConfig.map((cfg, idx) => ({
        label: `زر: ${cfg.label}`,
        value: `edit_${idx}`,
        emoji: cfg.emoji || undefined,
        description: cfg.description || cfg.welcomeTemplate
          ? `قالب: ${cfg.welcomeTemplate || "مخصص"}`
          : "بدون وصف",
      }));
      return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("select_button_to_edit")
          .setPlaceholder("اختر زراً لتعديله")
          .addOptions(options)
      );
    };

    // بناء صف الأزرار الرئيسية
    const mainRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("apply_convert")
        .setLabel("🚀 تطبيق التحويل")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("cancel_convert")
        .setLabel("❌ إلغاء")
        .setStyle(ButtonStyle.Danger)
    );

    // إرسال الرسالة التفاعلية الأولية
    await interaction.editReply({
      content: null,
      embeds: [
        {
          color: 0x3498db,
          title: "🔄 إعداد القائمة المنسدلة",
          description:
            "يمكنك تعديل وصف كل زر أو ربطه بقالب ترحيب من قوالب welcome.\nاضغط على الزر في القائمة لتعديله.",
        },
      ],
      components: [buildButtonsSelect(), mainRow],
    });

    // حلقة التفاعل
    while (true) {
      try {
        const filter = (i) => i.user.id === interaction.user.id;
        const compInteraction = await interaction.channel.awaitMessageComponent({
          filter,
          time: 600_000,
        });

        if (compInteraction.isButton()) {
          if (compInteraction.customId === "cancel_convert") {
            await compInteraction.deferUpdate();
            return compInteraction.editReply({
              embeds: [{ color: 0xff0000, description: "❌ تم الإلغاء." }],
              components: [],
            });
          }

          if (compInteraction.customId === "apply_convert") {
            await compInteraction.deferUpdate();
            break; // الخروج لإجراء التحويل
          }
          continue;
        }

        if (compInteraction.isStringSelectMenu()) {
          const value = compInteraction.values[0];

          // إذا اختار زراً من قائمة الأزرار
          if (compInteraction.customId === "select_button_to_edit") {
            const idx = parseInt(value.replace("edit_", ""));
            const current = buttonsConfig[idx];

            // إظهار خيارات التعديل لهذا الزر
            const editRow = new ActionRowBuilder().addComponents(
              new StringSelectMenuBuilder()
                .setCustomId(`edit_action_${idx}`)
                .setPlaceholder("اختر العملية")
                .addOptions([
                  { label: "✏️ كتابة وصف يدوي", value: "desc" },
                  { label: "📄 اختيار قالب ترحيب", value: "template" },
                  { label: "↩️ رجوع", value: "back" },
                ])
            );
            await compInteraction.deferUpdate();
            await compInteraction.editReply({
              embeds: [
                {
                  color: 0x3498db,
                  title: `تعديل: ${current.label}`,
                  description: `الوصف الحالي: ${current.description || "لا يوجد"}\nالقالب: ${current.welcomeTemplate || "لا يوجد"}`,
                },
              ],
              components: [editRow, mainRow],
            });
            continue;
          }

          // إذا اختار نوع التعديل لزر معين
          if (compInteraction.customId.startsWith("edit_action_")) {
            const idx = parseInt(compInteraction.customId.split("_")[2]);
            const action = value;

            if (action === "back") {
              await compInteraction.deferUpdate();
              await compInteraction.editReply({
                embeds: [
                  {
                    color: 0x3498db,
                    title: "🔄 إعداد القائمة المنسدلة",
                    description: "اختر زراً لتعديله.",
                  },
                ],
                components: [buildButtonsSelect(), mainRow],
              });
              continue;
            }

            if (action === "desc") {
              // فتح modal لإدخال وصف يدوي
              const modal = new ModalBuilder()
                .setCustomId(`modal_desc_${idx}`)
                .setTitle(`وصف لـ ${buttonsConfig[idx].label}`);
              modal.addComponents(
                new ActionRowBuilder().addComponents(
                  new TextInputBuilder()
                    .setCustomId("description")
                    .setLabel("الوصف (اتركه فارغاً للإزالة)")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
                    .setValue(buttonsConfig[idx].description || "")
                )
              );
              await compInteraction.showModal(modal);
              continue;
            }

            if (action === "template") {
              const templatesList = Object.keys(welcomeTemplates);
              if (templatesList.length === 0) {
                await compInteraction.deferUpdate();
                await compInteraction.followUp({
                  content: "⚠️ لا توجد قوالب ترحيب محفوظة. استخدم أمر `welcome-setup` أولاً.",
                  flags: MessageFlags.Ephemeral,
                });
                continue;
              }

              const templateRow = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId(`select_template_${idx}`)
                  .setPlaceholder("اختر قالب ترحيب")
                  .addOptions(
                    templatesList.map((name) => ({
                      label: name,
                      value: name,
                      emoji: "📄",
                    }))
                  )
              );
              await compInteraction.deferUpdate();
              await compInteraction.editReply({
                embeds: [
                  {
                    color: 0x3498db,
                    title: "اختيار قالب ترحيب",
                    description: "اختر قالباً من القائمة.",
                  },
                ],
                components: [templateRow, mainRow],
              });
              continue;
            }
          }

          // إذا اختار قالباً محدداً
          if (compInteraction.customId.startsWith("select_template_")) {
            const idx = parseInt(compInteraction.customId.split("_")[2]);
            const templateName = value;
            buttonsConfig[idx].welcomeTemplate = templateName;
            buttonsConfig[idx].welcomeMessage = null; // إلغاء أي نص مخصص
            buttonsConfig[idx].description = null;    // سنعتمد على القالب

            await compInteraction.deferUpdate();
            await compInteraction.editReply({
              embeds: [
                {
                  color: 0x3498db,
                  title: "🔄 إعداد القائمة المنسدلة",
                  description: `✅ تم ربط الزر "${buttonsConfig[idx].label}" بقالب "${templateName}".`,
                },
              ],
              components: [buildButtonsSelect(), mainRow],
            });
            continue;
          }

          await compInteraction.deferUpdate().catch(() => {});
          continue;
        }

        // معالجة المودال: إدخال وصف يدوي
        if (compInteraction.type === 5) {
          if (compInteraction.customId.startsWith("modal_desc_")) {
            const idx = parseInt(compInteraction.customId.split("_")[2]);
            const description = compInteraction.fields.getTextInputValue("description").trim();
            buttonsConfig[idx].description = description || null;
            // إزالة أي قالب سابق إذا تم إدخال وصف يدوي
            buttonsConfig[idx].welcomeTemplate = null;
            buttonsConfig[idx].welcomeMessage = null;

            await compInteraction.deferUpdate();
            await compInteraction.editReply({
              embeds: [
                {
                  color: 0x3498db,
                  title: "🔄 إعداد القائمة المنسدلة",
                  description: `✅ تم تعيين وصف للزر "${buttonsConfig[idx].label}".`,
                },
              ],
              components: [buildButtonsSelect(), mainRow],
            });
            continue;
          }
        }
      } catch (error) {
        console.error(error);
        return interaction.editReply({
          embeds: [{ color: 0xff0000, description: "⏰ انتهت مهلة الإعداد أو حدث خطأ." }],
          components: [],
        });
      }
    }

    // ============ الخطوة 3: تطبيق التحويل ============
    try {
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("اختر نوع المشكلة");

      buttonsConfig.forEach((cfg) => {
        const option = new StringSelectMenuOptionBuilder()
          .setLabel(cfg.label)
          .setValue(cfg.customId);

        if (cfg.emoji) {
          option.setEmoji(cfg.emoji);
        }

        if (cfg.description) {
          option.setDescription(cfg.description);
        } else if (cfg.welcomeTemplate) {
          // استخدم وصف القالب إن وجد
          const tmpl = welcomeTemplates[cfg.welcomeTemplate];
          if (tmpl && tmpl.description) {
            option.setDescription(tmpl.description.substring(0, 100));
          }
        }

        selectMenu.addOptions(option);
      });

      // إضافة خيار "Reset" كما في الأصل
      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Reset")
          .setValue("reset")
      );

      const selectRow = new ActionRowBuilder().addComponents(selectMenu);
      await message.edit({ components: [selectRow] });

      // تحديث بيانات التذكرة في قاعدة البيانات لكل زر (إن وجدت)
      for (const cfg of buttonsConfig) {
        // مفتاح التذكرة قد يكون مخزناً مسبقاً، نحدثه إذا وجد
        const ticketKey = `Ticket_${message.channel.id}_${cfg.customId}`;
        const existingTicket = await keyValueService.get("ticketDB", ticketKey);
        if (existingTicket) {
          existingTicket.welcomeMessage = cfg.welcomeTemplate
            ? `[template:${cfg.welcomeTemplate}]`
            : cfg.welcomeMessage || "";
          await keyValueService.set("ticketDB", ticketKey, existingTicket);
        }
      }

      await interaction.editReply({
        embeds: [{ color: 0x00ff00, description: "✅ تم تحويل الأزرار إلى قائمة منسدلة بنجاح." }],
        components: [],
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        embeds: [{ color: 0xff0000, description: "❌ حدث خطأ أثناء تحويل الأزرار." }],
        components: [],
      });
    }
  },
};