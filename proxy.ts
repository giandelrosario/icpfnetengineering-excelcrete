import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/employees', '/payroll', '/benefits', '/disbursement'];

export default function proxy(request: NextRequest) {
	const token = request.cookies.get('auth_token')?.value;
	const isProtectedRoute = PROTECTED_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));

	if (isProtectedRoute && !token) {
		const redirectUrl = new URL('/auth', request.url);
		redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
		return NextResponse.redirect(redirectUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/employees/:path*', '/payroll/:path*', '/benefits/:path*', '/disbursement/:path*'],
};
