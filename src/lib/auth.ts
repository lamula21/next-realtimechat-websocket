import { UpstashRedisAdapter } from '@next-auth/upstash-redis-adapter'
import { NextAuthOptions } from 'next-auth'
import { db } from './db'
import GoogleProvider from 'next-auth/providers/google'

// best practice to get env variables and throw error if not found
function getGoogleCredntials() {
	const clientId = process.env.GOOGLE_CLIENT_ID
	const clientSecret = process.env.GOOGLE_CLIENT_SECRET

	if (!clientId || clientId.length === 0) {
		throw new Error('Missing GOOGLE_CLIENT_ID')
	}

	if (!clientSecret || clientSecret.length === 0) {
		throw new Error('Missing GOOGLE_CLIENT_SECRET')
	}

	return { clientId, clientSecret }
}

export const authOptions: NextAuthOptions = {
	adapter: UpstashRedisAdapter(db), // connect auth with database
	session: {
		strategy: 'jwt', // handle session in middleware, not in DB (protect routes easily)
	},

	pages: {
		signIn: '/login', // custom login page
	},

	providers: [
		GoogleProvider({
			clientId: getGoogleCredntials().clientId,
			clientSecret: getGoogleCredntials().clientSecret,
		}),
	],

	callbacks: {
		async jwt({ token, user }) {
			const dbUser = (await db.get(`user:${token.id}`)) as User | null

			if (!dbUser) {
				token.id = user!.id // ! asserts that user is not null
				return token
			}

			return {
				id: dbUser.id,
				name: dbUser.name,
				email: dbUser.email,
				picture: dbUser.image,
			}
		},

		async session({ session, token }) {
			if (token) {
				session.user.id = token.id
				session.user.name = token.name
				session.user.email = token.email
				session.user.image = token.picture
			}

			return session
		},

		redirect() {
			return '/dashboard'
		},
	},
}
