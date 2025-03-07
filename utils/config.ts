import "dotenv/config";
import { Config } from "../interfaces/Config";

let config: Config;

try {
  let _config = require("../config.json");
  config = _config;
} catch (error) {
  config = {
    TOKEN: process.env.TOKEN || "",
    PREFIX: process.env.PREFIX || "!",
    MAX_PLAYLIST_SIZE: parseInt(process.env.MAX_PLAYLIST_SIZE!) || 10,
    PRUNING: process.env.PRUNING === "true" ? true : false,
    STAY_TIME: parseInt(process.env.STAY_TIME!) || 30,
    DEFAULT_VOLUME: parseInt(process.env.DEFAULT_VOLUME!) || 100,
    LOCALE: process.env.LOCALE || "en",
    GENIUS_ACCESS_TOKEN: process.env.GENIUS_ACCESS_TOKEN || ""
  };
}

export { config };
