import type { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const ONE_HOURS = 1 * 60 * 60 * 1000;

const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				const password = credentials?.password;
				// const token = await signJwtAccessToken({ id: 'admin' });
				if (password === process.env.ADMIN_PASSWORD) {
					return { id: 'admin' };
				}
				return null;
			},
		}),
	],
	pages: {
		signIn: '/auth',
		signOut: '/auth',
	},
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: 'jwt',
		maxAge: ONE_HOURS,
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
