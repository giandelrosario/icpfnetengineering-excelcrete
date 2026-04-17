import { signJwtAccessToken } from '@/lib/jwt';
import { NextRequest } from 'next/server';

export const POST = async (request: NextRequest) => {
	const { password } = await request.json();

	if (password === process.env.ADMIN_PASSWORD) {
		const token = signJwtAccessToken({ role: 'admin' });
		return new Response(JSON.stringify({ message: 'Authentication successful', token }), { status: 200 });
	} else {
		return new Response(JSON.stringify({ message: 'Invalid password' }), { status: 401 });
	}
};
