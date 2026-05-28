const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const keyValueService = require("../services/keyValueService");

const COOLDOWN_MS = 4000;
const cooldowns = new Map();

function normalizeReply(reply) {
  if (!reply) return null;
  const normalized = reply.trigger ? { ...reply } : {
    trigger: reply.word,
    word: reply.word,
    type: "exact",
    mode: "text",
    reply: reply.reply || "",
    embed: null,
    button: null,
    addedBy: reply.addedBy || null,
  };
  normalized.word = normalized.word || normalized.trigger;
  normalized.type = normalized.type || normalized.matchType || "exact";
  normalized.mode = normalized.mode || "text";
  normalized.embed = normalized.embed || null;
  normalized.button = normalized.button || null;
  return normalized;
}

function normalizeReplies(replies) {
  return Array.isArray(replies) ? replies.map(normalizeReply).filter(Boolean) : [];
}

function matchesReply(reply, content) {
  const trigger = String(reply.trigger || reply.word || "");
  if (!trigger) return false;
  const mode = reply.matchType || reply.type || "exact";
  const text = String(content || "");
  const lowerText = text.toLowerCase();
  const lowerTrigger = trigger.toLowerCase();

  if (mode === "contains") return lowerText.includes(lowerTrigger);
  if (mode === "startsWith") return lowerText.startsWith(lowerTrigger);
  if (mode === "regex") {
    try {
      return new RegExp(trigger, "i").test(text);
    } catch {
      return false;
    }
  }
  return lowerText === lowerTrigger;
}

function isOnCooldown(guildId, channelId, reply) {
  const key = `${guildId}:${channelId}:${reply.trigger || reply.word}`;
  const now = Date.now();
  const last = cooldowns.get(key) || 0;
  if (now - last < COOLDOWN_MS) return true;
  cooldowns.set(key, now);
  return false;
}

function safeColor(color) {
  if (!color) return "Random";
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  return "Random";
}

function buildAutoReplyPayload(reply, message) {
  const payload = {};
  const embedData = reply.embed || {};
  const hasEmbed = reply.mode === "embed" || embedData.title || embedData.description || embedData.image || embedData.thumbnail;

  if (hasEmbed) {
    const embed = new EmbedBuilder().setColor(safeColor(embedData.color));
    if (embedData.title) embed.setTitle(embedData.title);
    if (embedData.description || reply.reply) embed.setDescription(embedData.description || reply.reply);
    if (embedData.image) embed.setImage(embedData.image);
    if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail);
    embed.setTimestamp();
    payload.embeds = [embed];
  } else {
    payload.content = reply.reply || " ";
  }

  if (reply.button?.label && reply.button?.url) {
    payload.components = [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel(reply.button.label)
          .setURL(reply.button.url)
          .setStyle(ButtonStyle.Link)
      ),
    ];
  }

  return payload;
}

async function getGuildReplies(guildId) {
  const replies = await keyValueService.get("CookiesDB", `replys_${guildId}`);
  return normalizeReplies(replies);
}

async function saveGuildReplies(guildId, replies) {
  await keyValueService.set("CookiesDB", `replys_${guildId}`, normalizeReplies(replies));
  return replies;
}

async function handleAutoReplyMessage(message) {
  if (!message.guild || message.author.bot) return false;
  const replies = await getGuildReplies(message.guild.id);
  if (!replies.length) return false;
  const found = replies.find((reply) => matchesReply(reply, message.content));
  if (!found) return false;
  if (isOnCooldown(message.guild.id, message.channel.id, found)) return true;
  await message.reply(buildAutoReplyPayload(found, message));
  return true;
}

module.exports = {
  COOLDOWN_MS,
  normalizeReply,
  normalizeReplies,
  matchesReply,
  buildAutoReplyPayload,
  getGuildReplies,
  saveGuildReplies,
  handleAutoReplyMessage,
};
