import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/config/prisma';
import { verifyJwt } from '@/lib/jwt';

export const PUT = async (request: NextRequest, ctx: RouteContext<'/api/benefits/[benefit_id]'>) => {
	const { benefit_id } = await ctx.params;

	const authHeader = await request.headers.get('Authorization');
	const token = authHeader?.replace('Bearer ', '');
	const isVerified = await verifyJwt(token as string);

	if (!isVerified) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { sss_share, philhealth_share, pagibig_share } = await request.json();

		const updated = await prisma.employerShare.update({
			where: { id: parseInt(benefit_id) },
			data: {
				...(sss_share !== undefined && { sss_share }),
				...(philhealth_share !== undefined && { philhealth_share }),
				...(pagibig_share !== undefined && { pagibig_share }),
			},
		});

		return new Response(JSON.stringify(updated), {
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		console.error('Error updating settings:', error);
		return new Response(JSON.stringify({ message: 'Internal server error' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
};
