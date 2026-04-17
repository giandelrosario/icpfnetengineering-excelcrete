import { prisma } from '@/config/prisma';
import { verifyJwt } from '@/lib/jwt';
import { NextResponse } from 'next/server';

export const POST = async (request: Request, ctx: RouteContext<'/api/employees/[employee_id]/bir'>) => {
	const { employee_id } = await ctx.params;
	const body = await request.json();

	const authHeader = await request.headers.get('Authorization');
	const token = authHeader?.replace('Bearer ', '');
	const isVerified = await verifyJwt(token as string);

	if (!isVerified) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const existingSettings = await prisma.bIRSettings.findUnique({
			where: { employee_id: Number(employee_id) },
		});

		if (existingSettings) {
			// Update existing settings
			const updatedSettings = await prisma.bIRSettings.update({
				where: { employee_id: Number(employee_id) },
				data: {
					tin_no: body.tin_no,
					start_date: new Date(body.start_date),
				},
			});
			return new Response(JSON.stringify(updatedSettings), { status: 200 });
		} else {
			// Create new settings
			const newSettings = await prisma.bIRSettings.create({
				data: {
					employee_id: Number(employee_id),
					tin_no: body.tin_no,
					start_date: new Date(body.start_date),
				},
			});
			return new Response(JSON.stringify(newSettings), { status: 201 });
		}
	} catch (error) {
		console.error('Error updating/creating BIR settings:', error);
		return new Response(JSON.stringify({ message: 'An error occurred while updating/creating BIR settings.' }), { status: 500 });
	}
};
