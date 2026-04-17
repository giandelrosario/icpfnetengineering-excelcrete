import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/config/prisma';
import { verifyJwt } from '@/lib/jwt';

export const GET = async (request: NextRequest) => {
	const authHeader = await request.headers.get('Authorization');
	const token = authHeader?.replace('Bearer ', '');
	const isVerified = await verifyJwt(token as string);

	if (!isVerified) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}
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
	const authHeader = await request.headers.get('Authorization');
	const token = authHeader?.replace('Bearer ', '');
	const isVerified = await verifyJwt(token as string);

	if (!isVerified) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

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
