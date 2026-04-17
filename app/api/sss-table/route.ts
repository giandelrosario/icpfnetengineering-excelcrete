import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/config/prisma';
import { verifyJwt } from '@/lib/jwt';

export const GET = async (request: NextRequest, ctx: RouteContext<'/api/sss-table'>) => {
	const authHeader = await request.headers.get('Authorization');
	const token = authHeader?.replace('Bearer ', '');
	const isVerified = await verifyJwt(token as string);

	if (!isVerified) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}
	try {
		const rows = await prisma.sSSTable.findMany({
			orderBy: [{ salary_range_from: 'asc' }, { salary_range_to: 'asc' }],
		});
		return new Response(JSON.stringify(rows), {
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		console.error('Error fetching SSS table:', error);
		return new Response(JSON.stringify({ message: 'Internal server error' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
};
