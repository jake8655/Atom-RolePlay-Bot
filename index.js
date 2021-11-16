import Discord from "discord.js";
import fs from "fs/promises";
import dotenv from "dotenv";
dotenv.config();

import GetFivemInfo from "./functions/fivem.js";
import StatusMessage from "./functions/status.js";

const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
  partials: ["CHANNEL", "MESSAGE"],
});

client.on("ready", async () => {
  console.log("\x1b[32m%s\x1b[0m", `${client.user.username} is online!`);
  setStatus();

  const msgID = JSON.parse(await fs.readFile("./config/dontchange.json"));

  if (!msgID.messageID) {
    const message = await client.channels.cache
      .get(process.env.CHANNEL_ID)
      .send({
        embeds: [
          await StatusMessage(
            await client.guilds.cache.get(process.env.GUILD_ID).name,
            await client.guilds.cache.get(process.env.GUILD_ID).memberCount,
            await client.guilds.cache.get(process.env.GUILD_ID).iconURL()
          ),
        ],
      });

    msgID.messageID = message.id;
    await fs.writeFile("./config/dontchange.json", JSON.stringify(msgID));
  }

  setInterval(async () => {
    const guild = await client.guilds.cache.get(process.env.GUILD_ID);
    const members = (await guild.fetch()).approximateMemberCount;

    const fetchedMsg = await client.channels.cache
      .get(process.env.CHANNEL_ID)
      .messages.fetch({ around: msgID.messageID, limit: 1 });
    const msg = fetchedMsg.first();

    return await msg.edit({
      embeds: [await StatusMessage(guild.name, members, guild.iconURL())],
    });
  }, process.env.UPDATE_INTERVAL);
});

async function setStatus() {
  const [serverInfo, players] = await GetFivemInfo();

  if (!serverInfo) {
    client.user.setActivity(`Szerver offline ❌`, { type: "WATCHING" });
    return client.user.setStatus("dnd");
  }

  client.user.setActivity(
    `Játékosok: ${players.length}/${serverInfo.vars.sv_maxClients}`,
    { type: "WATCHING" }
  );
  client.user.setStatus("online");
}

client.login(process.env.TOKEN);
