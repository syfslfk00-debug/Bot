const keyValueService = require("../../services/keyValueService");
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

module.exports = {
  ownersOnly: false,
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName("new-apply")
    .setDescription("انشاء تقديم جديد")
    .addRoleOption((Option) =>
      Option.setName(`role`)
        .setDescription(`الرتبة التي سوف يتم انشاء التقديم عليها`)
        .setRequired(true)
    )
    .addStringOption((Option) =>
      Option.setName(`ask1`).setDescription(`السوال الاول`).setRequired(true)
    )
    .addStringOption((Option) =>
      Option.setName(`ask2`).setDescription(`السوال الثاني`).setRequired(false)
    )
    .addStringOption((Option) =>
      Option.setName(`ask3`).setDescription(`السوال الثالث`).setRequired(false)
    )
    .addStringOption((Option) =>
      Option.setName(`ask4`).setDescription(`السوال الرابع`).setRequired(false)
    )
    .addStringOption((Option) =>
      Option.setName(`ask5`).setDescription(`السوال الخامس`).setRequired(false)
    )
    .addAttachmentOption((Option) =>
      Option.setName(`image`).setDescription(`الصورة في ايمبد التقديم`).setRequired(false)
    )
    .addStringOption((Option) =>
      Option.setName(`button`).setDescription(`لون الزر في رسالة التقديم`).addChoices(
        { name: `رمادي`, value: '2' },
        { name: `ازرق`, value: '1' },
        { name: `اخضر`, value: '3' },
        { name: `احمر`, value: '4' },
      ).setRequired(false)
    ),
  async execute(interaction, client) {
    const settings = await keyValueService.get('applyDB', 
      `apply_settings_${interaction.guild.id}`
    );
    if (!settings) {
      return interaction.reply({
        content: `**يرجى تسطيب نظام التقديمات اولا \n /setup-apply**`,
        ephemeral: true,
      });
    }

    let role = interaction.options.getRole(`role`);
    let ask1 = interaction.options.getString(`ask1`);
    let ask2 = interaction.options.getString(`ask2`);
    let ask3 = interaction.options.getString(`ask3`);
    let ask4 = interaction.options.getString(`ask4`);
    let ask5 = interaction.options.getString(`ask5`);
    let image = interaction.options.getAttachment(`image`);
    let button = interaction.options.getString(`button`) || "1";

    await keyValueService.set('applyDB', `apply_${interaction.guild.id}`, {
      roleid: role.id,
      ask1: ask1,
      ask2: ask2,
      ask3: ask3,
      ask4: ask4,
      ask5: ask5,
    });

    const modal = new ModalBuilder()
      .setCustomId('message_modal')
      .setTitle('رسالة التقديم');

    const messageInput = new TextInputBuilder()
      .setCustomId('message_input')
      .setLabel('رسالة التقديم في الامبد')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(messageInput);
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);

    const filter = (i) => i.customId === 'message_modal' && i.user.id === interaction.user.id;

    interaction.awaitModalSubmit({ filter, time: 60000 })
      .then(async (modalSubmit) => {
        const message = modalSubmit.fields.getTextInputValue('message_input');

        let theapplyroom = await interaction.guild.channels.cache.find(
          (ch) => ch.id == settings.applyroom
        );

        const applybutton = new ButtonBuilder()
          .setCustomId(`apply_button`)
          .setLabel(`التقديم`)
          .setStyle(button)
          .setEmoji("✍🏻");
        const row = new ActionRowBuilder().addComponents(applybutton);

        const embed = new EmbedBuilder()
          .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setDescription(`**${message}**`);
        if (image) {
          embed.setImage(image.url);
        }

        await theapplyroom.send({ embeds: [embed], components: [row] });
        await modalSubmit.reply({ content: 'تم إرسال رسالة التقديم بنجاح!', ephemeral: true });
      })
      .catch((err) => {
       // console.error('Modal submission timed out or failed:', err);
      });
  },
};
