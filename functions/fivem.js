import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export default async function GetFivemInfo() {
  try {
    let fivem = await Promise.all([
      fetch(`http://${process.env.FIVEM_IP}:30120/info.json`),
      fetch(`http://${process.env.FIVEM_IP}:30120/players.json`),
    ]);

    fivem = await Promise.all([fivem[0].json(), fivem[1].json()]);

    return fivem;
  } catch {
    return [null, []];
  }
}
