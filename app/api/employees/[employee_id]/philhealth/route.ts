import { prisma } from '@/config/prisma';
import { verifyJwt } from '@/lib/jwt';
import { NextResponse } from 'next/server';

export const POST = async (request: Request, ctx: RouteContext<'/api/employees/[employee_id]/philhealth'>) => {
	const { employee_id } = await ctx.params;
	const body = await request.json();

	const authHeader = await request.headers.get('Authorization');
	const token = authHeader?.replace('Bearer ', '');
	const isVerified = await verifyJwt(token as string);

	if (!isVerified) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const existingSettings = await prisma.philhealthSettings.findUnique({
			where: { employee_id: Number(employee_id) },
		});

		if (existingSettings) {
			// Update existing settings
			const updatedSettings = await prisma.philhealthSettings.update({
				where: { employee_id: Number(employee_id) },
				data: {
					philhealth_no: body.philhealth_no,
					ee_share: body.ee_share,
					start_date: new Date(body.start_date),
				},
			});
			return new Response(JSON.stringify(updatedSettings), { status: 200 });
		} else {
			// Create new settings
			const newSettings = await prisma.philhealthSettings.create({
				data: {
					employee_id: Number(employee_id),
					philhealth_no: body.philhealth_no,
					ee_share: body.ee_share,
					start_date: new Date(body.start_date),
				},
			});
			return new Response(JSON.stringify(newSettings), { status: 201 });
		}
	} catch (error) {
		console.error('Error updating/creating PhilHealth settings:', error);
		return new Response(JSON.stringify({ message: 'An error occurred while updating/creating PhilHealth settings.' }), { status: 500 });
	}
};
