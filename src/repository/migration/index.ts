import m1 from "../../../drizzle/0000_init.sql?raw";
import m2 from "../../../drizzle/0001_worried_cannonball.sql?raw";
import m3 from "../../../drizzle/0002_reflective_reptil.sql?raw";
import m4 from "../../../drizzle/0003_tiny_shockwave.sql?raw";

import { MigrationMeta } from "./migrate-browser";
const migrations: MigrationMeta[] = [
  {
    sql: [m1],
    folderMillis: 0,
    hash: "0000_init",
    bps: true,
  },
  {
    sql: [m2],
    folderMillis: 0,
    hash: "0001_worried_cannonball",
    bps: true,
  },
  {
    sql: [m3],
    folderMillis: 0,
    hash: "0002_reflective_reptil",
    bps: true,
  },
  {
    sql: [m4],
    folderMillis: 1756539647955,
    hash: "0003_tiny_shockwave",
    bps: true,
  }
];

export default migrations;
