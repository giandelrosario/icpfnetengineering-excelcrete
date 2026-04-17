import { prisma } from '@/config/prisma';
import { verifyJwt } from '@/lib/jwt';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest, ctx: RouteContext<'/api/employees/[employee_id]/sss'>) => {
	const body = await request.json();
	const { employee_id } = await ctx.params;

	const authHeader = await request.headers.get('Authorization');
	const token = authHeader?.replace('Bearer ', '');
	const isVerified = await verifyJwt(token as string);

	if (!isVerified) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const existingSettings = await prisma.sSSSettings.findUnique({
			where: { employee_id: Number(employee_id) },
		});

		if (existingSettings) {
			// Update existing settings
			const updatedSettings = await prisma.sSSSettings.update({
				where: { employee_id: Number(employee_id) },
				data: {
					sss_no: body.sss_no,
					ee_share: body.ee_share,
					start_date: new Date(body.start_date),
				},
			});
			return new Response(JSON.stringify(updatedSettings), { status: 200 });
		} else {
			// Create new settings
			const newSettings = await prisma.sSSSettings.create({
				data: {
					employee_id: Number(employee_id),
					sss_no: body.sss_no,
					ee_share: body.ee_share,
					start_date: new Date(body.start_date),
				},
			});
			return new Response(JSON.stringify(newSettings), { status: 201 });
		}
	} catch (error) {
		console.error('Error updating/creating SSS settings:', error);
		return new Response(JSON.stringify({ message: 'An error occurred while updating/creating SSS settings.' }), { status: 500 });
	}
};
