import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getLyrics } from "genius-lyrics-api";
import { i18n } from "../utils/i18n";
import { config } from "../utils/config";



import { bot } from "../index";


export default {
  data: new SlashCommandBuilder().setName("lyrics").setDescription(i18n.__("lyrics.description"))
  .addStringOption((option) => option.setName("song").setDescription("The song name").setRequired(false))
  .addStringOption((option) => option.setName("artist").setDescription("The artist name").setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!config.GENIUS_ACCESS_TOKEN || config.GENIUS_ACCESS_TOKEN=== "") return interaction.reply(i18n.__("lyrics.errorNotConfigured")).catch(console.error);
    const queue = bot.queues.get(interaction.guild!.id);

    if ((!queue || !queue.songs.length) && !interaction.options.getString('song') && !interaction.options.getString('artist')) return interaction.reply(i18n.__("lyrics.errorNotQueue")).catch(console.error);

    await interaction.reply("⏳ Loading...").catch(console.error);

    let lyrics = null;
    let title: string = interaction.options.getString('song') || queue?.songs[0].title || ' ';
    let artist: string = interaction.options.getString('artist') || ' '

    if (title === " " && artist === " ") return interaction.reply(i18n.__("lyrics.errorNotQueue")).catch(console.error)

    try {
      const options = {
        apiKey: config.GENIUS_ACCESS_TOKEN,
        title: title,
        artist: artist,
        optimizeQuery: true
      };

      lyrics = await getLyrics(options);

      if (!lyrics) lyrics = i18n.__mf("lyrics.lyricsNotFound", { title: title });
    } catch (error) {
      console.error(error);
      lyrics = i18n.__mf("lyrics.lyricsNotFound", { title: title });
    }

    let lyricsEmbed = new EmbedBuilder()
      .setTitle(i18n.__mf("lyrics.embedTitle", { title: title }))
      .setDescription(lyrics.length >= 4096 ? `${lyrics.substr(0, 4093)}...` : lyrics)
      .setColor("#F8AA2A")
      .setTimestamp();

    return interaction.editReply({ content: "", embeds: [lyricsEmbed] }).catch(console.error);
  }
};
