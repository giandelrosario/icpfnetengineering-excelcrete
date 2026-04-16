import { NextRequest } from 'next/server';
import { prisma } from '@/config/prisma';

type TEmployeeRelative = {
	employee_id?: number;
	first_name: string;
	middle_name: string;
	last_name: string;
	relationship: string;
	contact_no: string;
	address: string;
	occupation: string;
	birth_date: string;
	birth_place: string;
	hire_date?: string;
};

type TSalaryHistory = {
	employee_id?: number;
	amount: number;
};

type TSSSSettings = {
	employee_id?: number;
	ee_share: number;
	start_date: string;
	sss_no: string;
};
type TPhilhealthSettings = {
	employee_id?: number;
	ee_share: number;
	start_date: string;
	philhealth_no: string;
};
type TPagIBIGSettings = {
	employee_id?: number;
	ee_share: number;
	start_date: string;
	pagibig_no: string;
};
type TBIRSettings = {
	employee_id?: number;
	start_date: string;
	tin_no: string;
};

type TEmployee = {
	first_name: string;
	middle_name: string;
	last_name: string;
	email: string;
	contact_no: string;
	hire_date: Date;
	birth_place: string;
	birth_date: string;
	religion: string;
	citizenship: string;
	civil_status: string;
};

type TPayrollLogsBenefits = {
	id: number;
	payroll_logs_id: number;
	benefit_title: string;
	benefit_key: string;
	amount: number;
	created_at: Date;
	updated_at: Date;
};

export const GET = async (request: NextRequest) => {
	const searchParams = request.nextUrl.searchParams;
	const status = searchParams.get('status') as string | undefined;

	try {
		const employees = await prisma.employee.findMany({
			select: {
				id: true,
				first_name: true,
				middle_name: true,
				last_name: true,
				contact_no: true,
				email: true,
				civil_status: true,
				birth_date: true,
				salary_history: true,
				payroll_logs: {
					select: {
						benefits: {
							select: {
								benefit_key: true,
							},
						},
					},
				},
			},
			where: {
				...(status && { status }),
			},
		});

		const payload = employees.map((employee) => {
			// Collect all benefits from all payroll logs
			const allBenefits = employee.payroll_logs.flatMap((log) => log.benefits);

			// Count each benefit type
			const no_sss_contributions = allBenefits.filter((b) => b.benefit_key === 'sss').length;
			const no_philhealth_contributions = allBenefits.filter((b) => b.benefit_key === 'philhealth').length;
			const no_pagibig_contributions = allBenefits.filter((b) => b.benefit_key === 'pagibig').length;

			const salaryHistory = employee.salary_history ?? [];
			const salary = salaryHistory.length > 0 ? (salaryHistory[0]?.amount ?? 0) : 0;

			return {
				id: employee.id,
				first_name: employee.first_name,
				middle_name: employee.middle_name,
				last_name: employee.last_name,
				contact_no: employee.contact_no,
				email: employee.email,
				civil_status: employee.civil_status,
				birth_date: employee.birth_date,
				salary,
				no_sss_contributions,
				no_philhealth_contributions,
				no_pagibig_contributions,
			};
		});

		return new Response(JSON.stringify(payload), {
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		console.error('Error fetching employees:', error);
		return new Response(JSON.stringify({ message: 'An error occurred while fetching employees.' }), {
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
};

export const POST = async (request: NextRequest) => {
	const body = (await request.json()) as TEmployee & {
		relatives: TEmployeeRelative[];
		salary?: TSalaryHistory;
		sss_settings?: TSSSSettings;
		philhealth_settings?: TPhilhealthSettings;
		pagibig_settings?: TPagIBIGSettings;
		bir_settings?: TBIRSettings;
	};

	try {
		const employee = await prisma.employee.create({
			data: {
				first_name: body.first_name,
				middle_name: body.middle_name,
				last_name: body.last_name,
				email: body.email,
				contact_no: body.contact_no,
				birth_place: body.birth_place,
				birth_date: new Date(body.birth_date),
				religion: body.religion,
				citizenship: body.citizenship,
				civil_status: body.civil_status,
				hire_date: new Date(body.hire_date),
				relatives: {
					createMany: {
						data: body.relatives.map((relative) => ({
							first_name: relative.first_name,
							middle_name: relative.middle_name,
							last_name: relative.last_name,
							relationship: relative.relationship,
							contact_no: relative.contact_no,
							address: relative.address,
							occupation: relative.occupation,
							birth_date: relative.birth_date ? new Date(relative.birth_date) : new Date(),
							birth_place: relative.birth_place,
						})),
					},
				},
				...(body.salary && {
					salary_history: {
						createMany: {
							data: {
								amount: body.salary?.amount || 0,
							},
						},
					},
				}),
				...(body.sss_settings && {
					sss_settings: {
						create: {
							sss_no: body.sss_settings.sss_no,
							ee_share: body.sss_settings.ee_share,
							start_date: new Date(body.sss_settings.start_date),
						},
					},
				}),
				...(body.philhealth_settings && {
					philhealth_settings: {
						create: {
							philhealth_no: body.philhealth_settings.philhealth_no,
							ee_share: body.philhealth_settings.ee_share,
							start_date: new Date(body.philhealth_settings.start_date),
						},
					},
				}),
				...(body.pagibig_settings && {
					pagibig_settings: {
						create: {
							pagibig_no: body.pagibig_settings.pagibig_no,
							ee_share: body.pagibig_settings.ee_share,
							start_date: new Date(body.pagibig_settings.start_date),
						},
					},
				}),
				...(body.bir_settings && {
					bir_settings: {
						create: {
							tin_no: body.bir_settings.tin_no,
							start_date: new Date(body.bir_settings.start_date),
						},
					},
				}),
			},
			include: {
				relatives: true,
				salary_history: true,
				sss_settings: true,
				philhealth_settings: true,
				pagibig_settings: true,
				bir_settings: true,
			},
		});

		return new Response(JSON.stringify(employee), {
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		console.error('Error creating employee:', error);
		return new Response(JSON.stringify({ message: 'An error occurred while creating the employee.' }), {
			headers: {
				'Content-Type': 'application/json',
			},
			status: 500,
		});
	}
};
