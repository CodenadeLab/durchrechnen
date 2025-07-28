import { ConsoleTransport } from "loglayer";

export function createConsoleTransport() {
  return new ConsoleTransport({
    logger: console,
  });
}
