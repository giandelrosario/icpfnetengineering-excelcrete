import { NextRequest } from 'next/server';
import { prisma } from '@/config/prisma';

export const GET = async (request: NextRequest, ctx: RouteContext<'/api/sss-table'>) => {
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
