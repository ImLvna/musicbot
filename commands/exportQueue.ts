import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { bot } from "../index";
import { i18n } from "../utils/i18n";

export default {
  data: new SlashCommandBuilder().setName("exportqueue").setDescription(i18n.__("exportqueue.description")),
  execute(interaction: ChatInputCommandInteraction) {
    const queue = bot.queues.get(interaction.guild!.id);

    if (!queue)
      return interaction.reply({ content: i18n.__("loop.errorNotQueue"), ephemeral: true }).catch(console.error);

    let content = queue.songs.map((song) => `\`${song.url.substring(song.url.lastIndexOf("v=") + 2)}\``).join("\n");

    content += `\n\n- Loop: ${queue.loop}\n- Volume: ${queue.volume.toLocaleString("en-US", {
      minimumIntegerDigits: 3
    })}`;

    if (interaction.replied) interaction.followUp(content).catch(console.error);
    else interaction.reply(content).catch(console.error);
  }
};
