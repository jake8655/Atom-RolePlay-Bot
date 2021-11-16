import Discord from "discord.js";
import fs from "fs/promises";
import dotenv from "dotenv";
dotenv.config();
import GetFivemInfo from "./fivem.js";
import embedConfig from "../config/embed-config.js";

export default async function StatusMessage(serverName, members, serverImage) {
  const [serverInfo, players] = await GetFivemInfo();
  const record = await getPlayerRecord(players.length);

  const embed = new Discord.MessageEmbed()
    .setAuthor(
      embedConfig.author || serverName,
      embedConfig.image || serverImage
    )
    .setDescription(embedConfig.description)
    .addField(
      "Server Státusza:",
      serverInfo ? ":white_check_mark: Elérhető" : ":x: Nem Elérhető",
      true
    )
    .addField(
      "Szerver IP-Címe:",
      `:electric_plug: ${process.env.FIVEM_IP}`,
      true
    )
    .addField("Discord Tagok:", `:robot: ${members}`, true)
    .addField("Játékos Rekord:", `:trophy: ${record}`, true)
    .addField("Weboldal:", `:desktop: ${process.env.WEBSITE}`, true)
    .addField(
      "Elérhető Játékosok:",
      `:video_game: ${players.length.toString()}`,
      true
    )
    .setColor(serverInfo ? "GREEN" : "RED");

  return embed;
}

async function getPlayerRecord(currentPlayers) {
  try {
    const oldRecord = JSON.parse(await fs.readFile("./config/dontchange.json"));

    if (oldRecord.record === currentPlayers) return currentPlayers;

    if (oldRecord.record < currentPlayers) {
      oldRecord.record = currentPlayers;
      await fs.writeFile("./config/dontchange.json", JSON.stringify(oldRecord));
      return currentPlayers;
    }

    return oldRecord.record;
  } catch {
    return currentPlayers;
  }
}
