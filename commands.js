import Discord from "discord.js";
import roleConfig from "./config/roles.js";

export function addRole(msg) {
  const embed = new Discord.MessageEmbed()
    .setColor("RED")
    .setAuthor(
      `${msg.author.username}#${msg.author.discriminator}`,
      msg.author.avatarURL()
    )
    .setTimestamp()
    .setFooter(msg.guild.name, msg.guild.iconURL())
    .setDescription(
      "**Helytelen használat! :x:**\n```-rangadas <@felhasználó> <@rang>```"
    );
  if (!msg.mentions.members.first() || !msg.mentions.roles.first())
    return msg.reply({ embeds: [embed] });

  if (!roleConfig.factionRoles.includes(msg.mentions.roles.first().id)) {
    embed.setDescription("**Helytelen rang!**");
    return msg.reply({ embeds: [embed] });
  }

  if (msg.mentions.members.first().roles.cache.has(roleConfig.factionJump)) {
    embed.setDescription(
      `**${msg.mentions.members.first()} jelenleg frakció jump alatt van!**`
    );
    return msg.reply({ embeds: [embed] });
  }

  if (msg.mentions.members.first().roles.cache.has(msg.mentions.roles.first().id)) {
    embed.setDescription(
      `**${msg.mentions.members.first()} már rendelkezik ${msg.mentions.roles.first()} rangal!**`
    );
    return msg.reply({ embeds: [embed] });
  }

  msg.mentions.members.first().roles.add(msg.mentions.roles.first());

  const successEmbed = new Discord.MessageEmbed()
    .setColor("GREEN")
    .setTitle("Rangkérelem sikeres!")
    .setTimestamp()
    .setFooter(msg.guild.name, msg.guild.iconURL())
    .setDescription(
      `**${msg.mentions.members.first()} sikeresen megkapta a rangot! :white_check_mark:**`
    );
  msg.reply({ embeds: [successEmbed] });
}

export function rmRole(msg) {
    const embed = new Discord.MessageEmbed()
      .setColor("RED")
      .setAuthor(
        `${msg.author.username}#${msg.author.discriminator}`,
        msg.author.avatarURL()
      )
      .setTimestamp()
      .setFooter(msg.guild.name, msg.guild.iconURL())
      .setDescription(
        "**Helytelen használat! :x:**\n```-rangadas <@felhasználó> <@rang>```"
      );
    if (!msg.mentions.members.first() || !msg.mentions.roles.first())
      return msg.reply({ embeds: [embed] });
  
    if (!roleConfig.factionRoles.includes(msg.mentions.roles.first().id)) {
      embed.setDescription("**Helytelen rang!**");
      return msg.reply({ embeds: [embed] });
    }
  
    if (msg.mentions.members.first().roles.cache.has(roleConfig.factionJump)) {
      embed.setDescription(
        `**${msg.mentions.members.first()} jelenleg frakció jump alatt van!**`
      );
      return msg.reply({ embeds: [embed] });
    }
  
    if (msg.mentions.members.first().roles.cache.has(msg.mentions.roles.first().id)) {
      embed.setDescription(
        `**${msg.mentions.members.first()} már rendelkezik ${msg.mentions.roles.first()} rangal!**`
      );
      return msg.reply({ embeds: [embed] });
    }
  
    msg.mentions.members.first().roles.add(msg.mentions.roles.first());
  
    const successEmbed = new Discord.MessageEmbed()
      .setColor("GREEN")
      .setTitle("Rangkérelem sikeres!")
      .setTimestamp()
      .setFooter(msg.guild.name, msg.guild.iconURL())
      .setDescription(
        `**${msg.mentions.members.first()} sikeresen megkapta a rangot! :white_check_mark:**`
      );
    msg.reply({ embeds: [successEmbed] });
  }