import { connectDb } from "@api/db";
import type { Database } from "@api/db";
import { getGeoContext } from "@api/utils/geo";
import { TRPCError, initTRPC } from "@trpc/server";
import type { Context } from "hono";
import superjson from "superjson";
