import { auth } from "../lib/auth";

export type Session = {
  user: {
    id: string;
    email?: string;
    name?: string;
    role?: string;
    isActive?: boolean;
  };
};

export async function verifySession(
  sessionToken?: string,
): Promise<Session | null> {
  if (!sessionToken) return null;

  try {
    const session = await auth.api.getSession({
      headers: new Headers({
        cookie: `better-auth.session_token=${sessionToken}`,
      }),
    });

    if (!session?.user) return null;

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        isActive: session.user.isActive,
      },
    };
  } catch {
    return null;
  }
}

export async function verifyAccessToken(
  accessToken?: string,
): Promise<Session | null> {
  return verifySession(accessToken);
}
