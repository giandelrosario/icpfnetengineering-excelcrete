import { prisma } from '@/config/prisma';

export const POST = async (request: Request, ctx: RouteContext<'/api/employees/[employee_id]/pagibig'>) => {
	const { employee_id } = await ctx.params;
	const body = await request.json();

	try {
		const existingSettings = await prisma.pagIBIGSettings.findUnique({
			where: { employee_id: Number(employee_id) },
		});

		if (existingSettings) {
			// Update existing settings
			const updatedSettings = await prisma.pagIBIGSettings.update({
				where: { employee_id: Number(employee_id) },
				data: {
					pagibig_no: body.pagibig_no,
					ee_share: body.ee_share,
					start_date: new Date(body.start_date),
				},
			});
			return new Response(JSON.stringify(updatedSettings), { status: 200 });
		} else {
			// Create new settings
			const newSettings = await prisma.pagIBIGSettings.create({
				data: {
					employee_id: Number(employee_id),
					pagibig_no: body.pagibig_no,
					ee_share: body.ee_share,
					start_date: new Date(body.start_date),
				},
			});
			return new Response(JSON.stringify(newSettings), { status: 201 });
		}
	} catch (error) {
		console.error('Error updating/creating Pag-IBIG settings:', error);
		return new Response(JSON.stringify({ message: 'An error occurred while updating/creating Pag-IBIG settings.' }), { status: 500 });
	}
};
