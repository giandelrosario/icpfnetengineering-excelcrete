import { withAuth } from 'next-auth/middleware';

export default withAuth(function proxy() {}, {
	pages: {
		signIn: '/auth',
	},
	callbacks: {
		authorized({ token }) {
			return !!token;
		},
	},
});

export const config = {
	matcher: ['/employees/:path*', '/payroll/:path*', '/benefits/:path*'],
};
