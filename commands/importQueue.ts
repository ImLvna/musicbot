import { ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import { bot } from "../index";
import { i18n } from "../utils/i18n";
import { canModifyQueue } from "../utils/queue";
import { Song } from "../structs/Song";
import { MusicQueue } from "../structs/MusicQueue";
import { joinVoiceChannel, DiscordGatewayAdapterCreator } from "@discordjs/voice";

export default {
  data: new SlashCommandBuilder().setName("importqueue").setDescription(i18n.__("importqueue.description"))
  .addStringOption((option) => option.setName("url").setDescription(i18n.__("importqueue.url")).setRequired(true)),
  async execute(interaction: ChatInputCommandInteraction) {
    let queue = bot.queues.get(interaction.guild!.id);
    
    const url = interaction.options.getString("url", true);

    const guildMemer = interaction.guild!.members.cache.get(interaction.user.id);

    if (!guildMemer || !guildMemer.voice?.channelId) return interaction.reply({ content: i18n.__("common.errorNotChannel"), ephemeral: true });
    
    const channel = await interaction.guild?.channels.cache.get(url.split("/")[5]) as TextChannel | null;
    
    if (!channel) return interaction.reply({ content: i18n.__("common.errorCommand"), ephemeral: true }).catch(console.error);
    
    const message = await channel.messages.fetch(url.split("/")[6]);
    
    if (!message) return interaction.reply({ content: i18n.__("common.errorCommand"), ephemeral: true }).catch(console.error);
    
    if (queue) queue.stop();
    
    queue = new MusicQueue({
      interaction,
      textChannel: interaction.channel! as TextChannel,
      connection: joinVoiceChannel({
        channelId: guildMemer!.voice.channelId!,
        guildId: interaction.guild!.id,
        adapterCreator: interaction.guild!.voiceAdapterCreator as DiscordGatewayAdapterCreator
      })
    });

    if (queue.waitTimeout !== null) clearTimeout(queue.waitTimeout);
    queue.waitTimeout = null;

    bot.queues.set(interaction.guild!.id, queue);

    let dataSection = false;
    
    let volumeToSet: number = 0;
    let i=0
    await interaction.reply(`0/${message.content.split("\n").length - 3}`)
    for (const data of message.content.split("\n")) {
      if (!dataSection) {
        if (data === "") {
          dataSection = true;
          continue;
        }

        let song: Song;
        try {
          song = await Song.from(`https://youtube.com/watch?v=${data.substring(1, data.length - 1)}`)
        } catch (e) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          song = await Song.from(`https://youtube.com/watch?v=${data.substring(1, data.length - 1)}`)
        }
        queue.songs.push(song);
        i++;
        interaction.editReply(`${i}/${message.content.split("\n").length - 3}`);
        continue;
      }

      if (data.startsWith("- Loop: ")) queue.loop = data.substring(8) === "true";
      else if (data.startsWith("- Volume: ")) {
        volumeToSet = parseInt(data.substring(10));
      }
    }
    queue._setStopped(false);
    await queue.processQueue();

    queue.volume = volumeToSet;
    queue.resource.volume?.setVolumeLogarithmic(volumeToSet / 100);

    const content = i18n.__mf("importqueue.success", { num: queue.songs.length });

    interaction.editReply(content).catch(console.error);
  }
};
