import Discord from "discord.js";
import fs from "fs/promises";
import dotenv from "dotenv";
dotenv.config();

import GetFivemInfo from "./functions/fivem.js";
import StatusMessage from "./functions/status.js";
import { addRole, removeRole } from "./functions/commands.js";
import FactionJump from "./functions/faction-jump.js"
import roleConfig from "./config/roles.js";

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
  ],
  partials: ["CHANNEL", "MESSAGE", "GUILD_MEMBER"],
});

client.on("ready", async () => {
  console.log("\x1b[32m%s\x1b[0m", `${client.user.username} is online!`);
  setStatus();

  const msgID = JSON.parse(await fs.readFile("./config/dontchange.json"));

  if (!msgID.messageID) {
    const message = await client.channels.cache
      .get(process.env.CHANNEL_ID)
      .send(
        await StatusMessage(
          await client.guilds.cache.get(process.env.GUILD_ID).name,
          await client.guilds.cache.get(process.env.GUILD_ID).memberCount,
          await client.guilds.cache.get(process.env.GUILD_ID).iconURL()
        )
      );

    msgID.messageID = message.id;
    await fs.writeFile("./config/dontchange.json", JSON.stringify(msgID));
  }

  setInterval(async () => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    FactionJump(guild);

    const members = (await guild.fetch()).approximateMemberCount;

    const fetchedMsg = await client.channels.cache
      .get(process.env.CHANNEL_ID)
      .messages.fetch({ around: msgID.messageID, limit: 1 });
    const msg = fetchedMsg.first();

    return await msg.edit(
      await StatusMessage(guild.name, members, guild.iconURL())
    );
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

client.on("messageCreate", (msg) => {
  if (
    !msg.content.startsWith("-rangadas") &&
    !msg.content.startsWith("-ranglevetel")
  )
    return;

  if (
    msg.channel.id !== roleConfig.addRoleChannel &&
    msg.channel.id !== roleConfig.rmRoleChannel
  )
    return;

  const author = client.guilds.cache
    .get(process.env.GUILD_ID)
    .members.cache.get(msg.author.id);

  const hasRoles = author.roles.cache.some((role) =>
    roleConfig.leaderRoles.includes(role.id)
  );
  const embed = new Discord.MessageEmbed()
    .setColor("RED")
    .setAuthor(
      `${msg.author.username}#${msg.author.discriminator}`,
      msg.author.avatarURL()
    )
    .setTimestamp()
    .setFooter(msg.guild.name, msg.guild.iconURL())
    .setDescription("**Erre nincs engedélyed! :x:**");
  if (!hasRoles) {
    return msg.reply({ embeds: [embed] }).then((res) => {
      msg.react("❌");
      setTimeout(() => {
        res.delete();
      }, process.env.MSG_DELETE);
    });
  }

  if (msg.content.startsWith("-rangadas") && msg.channel.id === roleConfig.addRoleChannel) return addRole(msg);
  if (msg.content.startsWith("-ranglevetel") && msg.channel.id === roleConfig.rmRoleChannel) return removeRole(msg);
});

client.login(process.env.TOKEN);
