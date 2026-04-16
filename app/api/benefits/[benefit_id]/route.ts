import { NextRequest } from 'next/server';
import { prisma } from '@/config/prisma';

export const PUT = async (request: NextRequest, ctx: RouteContext<'/api/benefits/[benefit_id]'>) => {
	const { benefit_id } = await ctx.params;

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
