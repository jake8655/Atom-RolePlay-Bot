import Discord from "discord.js";
import roleConfig from "../config/roles.js";
import fsp from "fs/promises";

export async function addRole(msg) {
  const embed = new Discord.MessageEmbed()
    .setColor("RED")
    .setAuthor(
      `${msg.author.username}#${msg.author.discriminator}`,
      msg.author.avatarURL()
    )
    .setTimestamp()
    .setFooter(msg.guild.name, msg.guild.iconURL())
    .setDescription(
      /* cspell: disable-next-line */
      "**Helytelen használat! :x:**\n```-rangadas <@felhasználó> <@rang>```"
    );
  if (!msg.mentions.members.first() || !msg.mentions.roles.first()) {
    return msg.reply({ embeds: [embed] }).then((res) => {
      msg.react("❌");
      setTimeout(() => {
        res.delete();
      }, process.env.MSG_DELETE);
    });
  }

  if (!roleConfig.factionRoles.includes(msg.mentions.roles.first().id)) {
    /* cspell: disable-next-line */
    embed.setDescription("**Helytelen rang!**");
    return msg.reply({ embeds: [embed] }).then((res) => {
      msg.react("❌");
      setTimeout(() => {
        res.delete();
      }, process.env.MSG_DELETE);
    });
  }

  if (msg.mentions.members.first().roles.cache.has(roleConfig.factionJump)) {
    embed.setDescription(
      /* cspell: disable-next-line */
      `**${msg.mentions.members.first()} jelenleg frakció jump alatt van!**`
    );
    return msg.reply({ embeds: [embed] }).then((res) => {
      msg.react("❌");
      setTimeout(() => {
        res.delete();
      }, process.env.MSG_DELETE);
    });
  }

  if (
    msg.mentions.members.first().roles.cache.has(msg.mentions.roles.first().id)
  ) {
    embed.setDescription(
      /* cspell: disable-next-line */
      `**${msg.mentions.members.first()} már a frakció tagja!**`
    );
    return msg.reply({ embeds: [embed] }).then((res) => {
      msg.react("❌");
      setTimeout(() => {
        res.delete();
      }, process.env.MSG_DELETE);
    });
  }

  const roles = msg.mentions.members
    .first()
    .roles.cache.filter((r) => roleConfig.factionRoles.includes(r.id));
  if (roles.size) {
    embed.setDescription(
      /* cspell: disable-next-line */
      `**${msg.mentions.members.first()} már egy frakció tagja!**`
    );
    return msg.reply({ embeds: [embed] }).then((res) => {
      msg.react("❌");
      setTimeout(() => {
        res.delete();
      }, process.env.MSG_DELETE);
    });
  }

  msg.mentions.members.first().roles.add(msg.mentions.roles.first());

  const data = JSON.parse(await fsp.readFile("./users.json", "utf-8"));
  data.push(
    JSON.parse(`{"_${msg.mentions.members.first().id}": ${Date.now()}}`)
  );
  await fsp.writeFile("./users.json", JSON.stringify(data));

  msg.react("✅");
}

export async function removeRole(msg) {
  const embed = new Discord.MessageEmbed()
    .setColor("RED")
    .setAuthor(
      `${msg.author.username}#${msg.author.discriminator}`,
      msg.author.avatarURL()
    )
    .setTimestamp()
    .setFooter(msg.guild.name, msg.guild.iconURL())
    .setDescription(
      /* cspell: disable-next-line */
      "**Helytelen használat! :x:**\n```-ranglevetel <@felhasználó>```"
    );
  if (!msg.mentions.members.first()) {
    return msg.reply({ embeds: [embed] }).then((res) => {
      msg.react("❌");
      setTimeout(() => {
        res.delete();
      }, process.env.MSG_DELETE);
    });
  }

  const factionRole = msg.mentions.members
    .first()
    .roles.cache.find((role) => roleConfig.factionRoles.includes(role.id));

  if (!factionRole) {
    embed.setDescription(
      /* cspell: disable-next-line */
      `**${msg.mentions.members.first()} jelenleg nem egy frakció tagja!**`
    );
    return msg.reply({ embeds: [embed] }).then((res) => {
      msg.react("❌");
      setTimeout(() => {
        res.delete();
      }, process.env.MSG_DELETE);
    });
  }

  msg.mentions.members.first().roles.remove(factionRole);

  const data = JSON.parse(await fsp.readFile("./users.json", "utf-8"));
  const user = data.find(
    (u) => Object.keys(u)[0] === `_${msg.mentions.members.first().id}`
  );
  if (Date.now() - user[Object.keys(user)[0]] < roleConfig.factionTime) {
    await msg.mentions.members
      .first()
      .roles.add(
        msg.guild.roles.cache.find((role) => role.id === roleConfig.factionJump)
      );

    const file = JSON.parse(await fsp.readFile("./faction-jump.json", "utf-8"));
    file.push(
      JSON.parse(`{"_${msg.mentions.members.first().id}": ${Date.now()}}`)
    );
    await fsp.writeFile("./faction-jump.json", JSON.stringify(file));
  }
  let file = JSON.parse(await fsp.readFile("./users.json", "utf-8"));
  file = file.filter(
    (u) => Object.keys(u)[0] !== `_${msg.mentions.members.first().id}`
  );
  await fsp.writeFile("./users.json", JSON.stringify(file));

  msg.react("✅");
}
