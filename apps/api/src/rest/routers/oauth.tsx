import { OpenAPIHono } from "@hono/zod-openapi";
import { OAuthSuccess } from "../../components/oauth-success";
import { OAuthError } from "../../components/oauth-error";
import type { Context } from "../types";

export const oauthRouter = new OpenAPIHono<Context>();


// OAuth Success Page
oauthRouter.get("/oauth/success", (c) => {
  const session = c.get("session");
  const user = c.get("user");
  
  if (!user) {
    return c.html(<OAuthError errorMessage="Keine gültige Sitzung gefunden" />);
  }

  return c.html(<OAuthSuccess />);
});

// OAuth Error Page
oauthRouter.get("/oauth/error", (c) => {
  const reason = c.req.query("reason");
  const error = c.req.query("error");
  
  let errorMessage = "Bei der Anmeldung ist ein Fehler aufgetreten.";
  
  if (reason === "no_session") {
    errorMessage = "Keine gültige Sitzung gefunden";
  } else if (error) {
    errorMessage = error;
  }

  return c.html(<OAuthError errorMessage={errorMessage} />);
});