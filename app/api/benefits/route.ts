import { NextRequest } from 'next/server';
import { prisma } from '@/config/prisma';

export const GET = async (request: NextRequest) => {
	try {
		const settings = await prisma.employerShare.findFirst({
			orderBy: { created_at: 'desc' },
		});

		if (!settings) {
			// Create default settings if none exist
			const newSettings = await prisma.employerShare.create({
				data: {
					sss_share: 0,
					philhealth_share: 0,
					pagibig_share: 0,
				},
			});
			return new Response(JSON.stringify(newSettings), {
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}
		return new Response(JSON.stringify(settings), {
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		console.error('Error fetching settings:', error);
		return new Response(JSON.stringify({ message: 'Internal server error' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
};

export const POST = async (request: NextRequest, ctx: RouteContext<'/api/benefits'>) => {
	try {
		const { sss_share, philhealth_share, pagibig_share } = await request.json();

		const newSettings = await prisma.employerShare.create({
			data: {
				sss_share: sss_share || 0,
				philhealth_share: philhealth_share || 0,
				pagibig_share: pagibig_share || 0,
			},
		});
		return new Response(JSON.stringify(newSettings), {
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
