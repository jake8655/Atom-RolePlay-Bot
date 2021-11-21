import fsp from "fs/promises";
import roleConfig from "../config/roles.js";

export default async function FactionJump(guild) {
  const data = JSON.parse(await fsp.readFile("./faction-jump.json", "utf-8"));
  if (!data) return;

  data.forEach(async (user) => {
    if (Date.now() - user[Object.keys(user)[0]] >= roleConfig.factionJumpTime) {
      const member = await guild.members.fetch(Object.keys(user)[0].slice(1));

      member.roles.remove(guild.roles.cache.get(roleConfig.factionJump));
      data.splice(data.indexOf(user), 1);
      await fsp.writeFile("./faction-jump.json", JSON.stringify(data));
    }
  });
}
