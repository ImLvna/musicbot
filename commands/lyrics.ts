import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { i18n } from "../utils/i18n";
import { config } from "../utils/config";
import axios from "axios";
import * as cheerio from "cheerio";

import { bot } from "../index";

axios.defaults.headers.common["Authorization"] = `Bearer ${config.GENIUS_ACCESS_TOKEN}`;
axios.defaults.baseURL = "https://api.genius.com";

export default {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription(i18n.__("lyrics.description"))
    .addStringOption((option) => option.setName("song").setDescription("The song name").setRequired(false))
    .addStringOption((option) => option.setName("artist").setDescription("The artist name").setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!config.GENIUS_ACCESS_TOKEN || config.GENIUS_ACCESS_TOKEN === "")
      return interaction.reply(i18n.__("lyrics.errorNotConfigured")).catch(console.error);
    const queue = bot.queues.get(interaction.guild!.id);

    if (
      (!queue || !queue.songs.length) &&
      !interaction.options.getString("song") &&
      !interaction.options.getString("artist")
    )
      return interaction.reply(i18n.__("lyrics.errorNotQueue")).catch(console.error);

    await interaction.reply("⏳ Loading...").catch(console.error);

    let lyrics = null;
    let title = interaction.options.getString("song") || queue?.songs[0].title || " ";
    let artist = interaction.options.getString("artist");

    if (title === " ") return interaction.reply(i18n.__("lyrics.errorNotQueue")).catch(console.error);

    try {
      const songList = await axios.get("/search", {
        params: {
          q: `${title}${artist ? ` ${artist}` : ""}`
        }
      });

      title = `${songList.data.response.hits[0].result.title} - ${songList.data.response.hits[0].result.primary_artist.name}`;

      const html = await axios.get(songList.data.response.hits[0].result.url);

      const $ = cheerio.load(html.data);

      const lyricsContainer = $('[data-lyrics-container="true"]');

      // Replace <br> with newline
      $("br", lyricsContainer).replaceWith("\n");

      // Replace the elements with their text contents
      $("a", lyricsContainer).replaceWith((_i, el) => $(el).text());

      // Remove all child elements, leaving only top-level text content
      lyricsContainer.children().remove();

      lyrics = lyricsContainer.text();

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
