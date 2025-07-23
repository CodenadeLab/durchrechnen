import type { db } from "../db";

export type Context = {
  Variables: {
    db: typeof db;
  };
};
