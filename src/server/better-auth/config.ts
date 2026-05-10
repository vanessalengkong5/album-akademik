import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/server/db";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 4,
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				defaultValue: "mahasiswa",
			},
		},
	},
});

export type Session = typeof auth.$Infer.Session;
