import { prisma } from '@/config/prisma';
import { NextRequest } from 'next/server';

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

export const GET = async (request: NextRequest, ctx: RouteContext<'/api/employees/[employee_id]'>) => {
	const { employee_id } = await ctx.params;

	try {
		const employee = await prisma.employee.findUnique({
			where: { id: Number(employee_id) },
			include: {
				relatives: true,
				salary_history: { orderBy: { created_at: 'desc' } },
				sss_settings: true,
				philhealth_settings: true,
				pagibig_settings: true,
				bir_settings: true,
				payroll_logs: {
					select: {
						gross_pay: true,
						net_pay: true,
						title: true,
						payroll_month: true,
						payroll_year: true,
						process_at: true,
						benefits: {
							select: {
								benefit_key: true,
								amount: true,
							},
						},
					},
				},
			},
		});

		if (!employee) {
			return new Response(JSON.stringify({ message: 'Employee not found.' }), {
				headers: {
					'Content-Type': 'application/json',
				},
				status: 404,
			});
		}

		const employer_share = await prisma.employerShare.findFirst();

		const current_salary = employee.salary_history[0]?.amount ?? 0;

		const sss_table = await prisma.sSSTable.findFirst({
			where: {
				salary_range_from: { lte: current_salary },
				salary_range_to: { gte: current_salary },
			},
		});

		const sss_contribution = sss_table
			? {
					total:
						sss_table.er_ss && sss_table.er_mpf && sss_table.er_ec && sss_table.ee_ss && sss_table.ee_mpf
							? sss_table.er_ss + sss_table.er_mpf + sss_table.er_ec + sss_table.ee_ss + sss_table.ee_mpf
							: 0,
				}
			: {
					total: 0,
				};

		// const philhealth_contribution = PHILHEALTH_RATE(current_salary);
		const philhealth_contribution = {
			total: (current_salary * ((employer_share?.philhealth_share ?? 0) + (employee.philhealth_settings?.ee_share ?? 0))) / 100,
			rate: (employer_share?.philhealth_share ?? 0) + (employee.philhealth_settings?.ee_share ?? 0),
		};

		// const pagibig_contribution = PAG_IBIG_RATES(current_salary);
		const pagibig_contribution = {
			total: (employer_share?.pagibig_share ?? 0) + (employee.pagibig_settings?.ee_share ?? 0),
		};

		const allBenefits = employee.payroll_logs.flatMap((log) => log.benefits);

		const no_sss_contributions = allBenefits.filter((b) => b.benefit_key === 'sss').length;
		const no_philhealth_contributions = allBenefits.filter((b) => b.benefit_key === 'philhealth').length;
		const no_pagibig_contributions = allBenefits.filter((b) => b.benefit_key === 'pagibig').length;

		const payload = {
			...employee,
			sss_settings: employee.sss_settings ? { ...employee.sss_settings, ...sss_contribution, no_sss_contributions } : null,
			philhealth_settings: employee.philhealth_settings ? { ...employee.philhealth_settings, contribution: philhealth_contribution, no_philhealth_contributions } : null,
			pagibig_settings: employee.pagibig_settings ? { ...employee.pagibig_settings, contribution: pagibig_contribution, no_pagibig_contributions } : null,
		};

		return new Response(JSON.stringify(payload), {
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		console.error('Error fetching employee:', error);
		return new Response(JSON.stringify({ message: 'An error occurred while fetching the employee.' }), {
			headers: {
				'Content-Type': 'application/json',
			},
			status: 500,
		});
	}
};

export const PUT = async (request: NextRequest, ctx: RouteContext<'/api/employees/[employee_id]'>) => {
	const { employee_id } = await ctx.params;
	const searchParams = request.nextUrl.searchParams;
	const type = searchParams.get('type');

	if (type === 'personal_info') {
		const body = await request.json();
		try {
			const updatedEmployee = await prisma.employee.update({
				where: { id: Number(employee_id) },
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
				},
			});

			return new Response(JSON.stringify(updatedEmployee), {
				headers: {
					'Content-Type': 'application/json',
				},
				status: 200,
			});
		} catch (error) {
			console.error('Error updating employee:', error);
			return new Response(JSON.stringify({ message: 'An error occurred while updating the employee.' }), {
				headers: {
					'Content-Type': 'application/json',
				},
				status: 500,
			});
		}
	}

	if (type === 'contact_info') {
		const body = await request.json();
		try {
			const updatedEmployee = await prisma.employee.update({
				where: { id: Number(employee_id) },
				data: {
					email: body.email,
					contact_no: body.contact_no,
				},
			});

			return new Response(JSON.stringify(updatedEmployee), {
				headers: {
					'Content-Type': 'application/json',
				},
				status: 200,
			});
		} catch (error) {
			console.error('Error updating contact info:', error);
			return new Response(JSON.stringify({ message: 'An error occurred while updating contact info.' }), {
				headers: {
					'Content-Type': 'application/json',
				},
				status: 500,
			});
		}
	}

	if (type === 'relatives') {
		const body = await request.json();
		try {
			const { relatives } = body as { relatives: TEmployeeRelative[] };

			// Delete existing relatives
			await prisma.employeeRelative.deleteMany({
				where: { employee_id: Number(employee_id) },
			});

			// Create new relatives
			await prisma.employeeRelative.createMany({
				data: relatives.map((relative) => ({
					employee_id: Number(employee_id),
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
			});

			return new Response(JSON.stringify({ message: 'Relatives updated successfully.' }), {
				headers: {
					'Content-Type': 'application/json',
				},
				status: 200,
			});
		} catch (error) {
			console.error('Error updating relatives:', error);
			return new Response(JSON.stringify({ message: 'An error occurred while updating relatives.' }), {
				headers: {
					'Content-Type': 'application/json',
				},
				status: 500,
			});
		}
	}

	if (type === 'salary') {
		const body = await request.json();
		try {
			const { salary } = body as { salary: TSalaryHistory };

			// Create new salary history entry
			await prisma.salaryHistory.create({
				data: {
					employee_id: Number(employee_id),
					amount: salary.amount,
				},
			});

			return new Response(JSON.stringify({ message: 'Salary history updated successfully.' }), {
				headers: {
					'Content-Type': 'application/json',
				},
				status: 200,
			});
		} catch (error) {
			console.error('Error updating salary history:', error);
			return new Response(JSON.stringify({ message: 'An error occurred while updating salary history.' }), {
				headers: {
					'Content-Type': 'application/json',
				},
				status: 500,
			});
		}
	}

	if (type === 'sss_settings' || type === 'philhealth_settings' || type === 'pagibig_settings' || type === 'bir_settings') {
		const body = await request.json();
		if (type === 'sss_settings') {
			const sssBody = body as TSSSSettings;
			try {
				const existingSettings = await prisma.sSSSettings.findUnique({
					where: { employee_id: Number(employee_id) },
				});

				if (existingSettings) {
					// Update existing settings
					const updatedSettings = await prisma.sSSSettings.update({
						where: { employee_id: Number(employee_id) },
						data: {
							sss_no: sssBody.sss_no,
							ee_share: sssBody.ee_share,
							start_date: new Date(sssBody.start_date),
						},
					});
					return new Response(JSON.stringify(updatedSettings), {
						headers: {
							'Content-Type': 'application/json',
						},
						status: 200,
					});
				} else {
					// Create new settings
					const newSettings = await prisma.sSSSettings.create({
						data: {
							employee_id: Number(employee_id),
							sss_no: sssBody.sss_no,
							ee_share: sssBody.ee_share,
							start_date: new Date(sssBody.start_date),
						},
					});
					return new Response(JSON.stringify(newSettings), {
						headers: {
							'Content-Type': 'application/json',
						},
						status: 201,
					});
				}
			} catch (error) {
				console.error('Error updating/creating SSS settings:', error);
				return new Response(JSON.stringify({ message: 'An error occurred while updating/creating SSS settings.' }), {
					headers: {
						'Content-Type': 'application/json',
					},
					status: 500,
				});
			}
		}

		if (type === 'philhealth_settings') {
			const philhealthBody = body as TPhilhealthSettings;
			try {
				const existingSettings = await prisma.philhealthSettings.findUnique({
					where: { employee_id: Number(employee_id) },
				});

				if (existingSettings) {
					// Update existing settings
					const updatedSettings = await prisma.philhealthSettings.update({
						where: { employee_id: Number(employee_id) },
						data: {
							philhealth_no: philhealthBody.philhealth_no,
							ee_share: philhealthBody.ee_share,
							start_date: new Date(philhealthBody.start_date),
						},
					});
					return new Response(JSON.stringify(updatedSettings), {
						headers: {
							'Content-Type': 'application/json',
						},
						status: 200,
					});
				} else {
					// Create new settings
					const newSettings = await prisma.philhealthSettings.create({
						data: {
							employee_id: Number(employee_id),
							philhealth_no: philhealthBody.philhealth_no,
							ee_share: philhealthBody.ee_share,
							start_date: new Date(philhealthBody.start_date),
						},
					});
					return new Response(JSON.stringify(newSettings), {
						headers: {
							'Content-Type': 'application/json',
						},
						status: 201,
					});
				}
			} catch (error) {
				console.error('Error updating/creating PhilHealth settings:', error);
				return new Response(JSON.stringify({ message: 'An error occurred while updating/creating PhilHealth settings.' }), {
					headers: {
						'Content-Type': 'application/json',
					},
					status: 500,
				});
			}
		}

		if (type === 'pagibig_settings') {
			const pagibigBody = body as TPagIBIGSettings;
			try {
				const existingSettings = await prisma.pagIBIGSettings.findUnique({
					where: { employee_id: Number(employee_id) },
				});

				if (existingSettings) {
					// Update existing settings
					const updatedSettings = await prisma.pagIBIGSettings.update({
						where: { employee_id: Number(employee_id) },
						data: {
							pagibig_no: pagibigBody.pagibig_no,
							ee_share: pagibigBody.ee_share,
							start_date: new Date(pagibigBody.start_date),
						},
					});
					return new Response(JSON.stringify(updatedSettings), {
						headers: {
							'Content-Type': 'application/json',
						},
						status: 200,
					});
				} else {
					// Create new settings
					const newSettings = await prisma.pagIBIGSettings.create({
						data: {
							employee_id: Number(employee_id),
							pagibig_no: pagibigBody.pagibig_no,
							ee_share: pagibigBody.ee_share,
							start_date: new Date(pagibigBody.start_date),
						},
					});
					return new Response(JSON.stringify(newSettings), {
						headers: {
							'Content-Type': 'application/json',
						},
						status: 201,
					});
				}
			} catch (error) {
				console.error('Error updating/creating Pag-IBIG settings:', error);
				return new Response(JSON.stringify({ message: 'An error occurred while updating/creating Pag-IBIG settings.' }), {
					headers: {
						'Content-Type': 'application/json',
					},
					status: 500,
				});
			}
		}

		if (type === 'bir_settings') {
			const birBody = body as TBIRSettings;
			try {
				const existingSettings = await prisma.bIRSettings.findUnique({
					where: { employee_id: Number(employee_id) },
				});

				if (existingSettings) {
					// Update existing settings
					const updatedSettings = await prisma.bIRSettings.update({
						where: { employee_id: Number(employee_id) },
						data: {
							tin_no: birBody.tin_no,
							start_date: new Date(birBody.start_date),
						},
					});
					return new Response(JSON.stringify(updatedSettings), {
						headers: {
							'Content-Type': 'application/json',
						},
						status: 200,
					});
				} else {
					// Create new settings
					const newSettings = await prisma.bIRSettings.create({
						data: {
							employee_id: Number(employee_id),
							tin_no: birBody.tin_no,
							start_date: new Date(birBody.start_date),
						},
					});
					return new Response(JSON.stringify(newSettings), {
						headers: {
							'Content-Type': 'application/json',
						},
						status: 201,
					});
				}
			} catch (error) {
				console.error('Error updating/creating BIR settings:', error);
				return new Response(JSON.stringify({ message: 'An error occurred while updating/creating BIR settings.' }), {
					headers: {
						'Content-Type': 'application/json',
					},
					status: 500,
				});
			}
		}
		// This will be handled by their respective endpoints
		return new Response(JSON.stringify({ message: 'Please use the specific endpoint for updating this type of settings.' }), {
			headers: {
				'Content-Type': 'application/json',
			},
			status: 400,
		});
	}

	if (type === 'archive') {
		try {
			const archivedEmployee = await prisma.employee.update({
				where: { id: Number(employee_id) },
				data: {
					status: 'ARCHIVED',
				},
			});

			return new Response(JSON.stringify(archivedEmployee), {
				headers: {
					'Content-Type': 'application/json',
				},
			});
		} catch (error) {
			console.error('Error archiving employee:', error);
			return new Response(JSON.stringify({ message: 'An error occurred while archiving the employee.' }), {
				headers: {
					'Content-Type': 'application/json',
				},
				status: 500,
			});
		}
	}

	if (type === 'activate') {
		try {
			const activatedEmployee = await prisma.employee.update({
				where: { id: Number(employee_id) },
				data: {
					status: 'ACTIVE',
				},
			});
			return new Response(JSON.stringify(activatedEmployee), {
				headers: {
					'Content-Type': 'application/json',
				},
			});
		} catch (error) {
			console.error('Error activating employee:', error);
			return new Response(JSON.stringify({ message: 'An error occurred while activating the employee.' }), {
				headers: {
					'Content-Type': 'application/json',
				},
				status: 500,
			});
			// return res.status(500).json({ message: 'An error occurred while activating the employee.' });
		}
	}

	return new Response(JSON.stringify({ message: 'Invalid update type.' }), {
		headers: {
			'Content-Type': 'application/json',
		},
		status: 400,
	});
};

export const DELETE = async (request: NextRequest, ctx: RouteContext<'/api/employees/[employee_id]'>) => {
	const { employee_id } = await ctx.params;

	try {
		await prisma.employee.delete({
			where: { id: Number(employee_id) },
			include: {
				payroll_logs: {
					include: {
						benefits: true,
					},
				},
				relatives: true,
				salary_history: true,
				sss_settings: true,
				philhealth_settings: true,
				pagibig_settings: true,
				bir_settings: true,
			},
		});
		return new Response(JSON.stringify({ message: 'Employee deleted successfully.' }), {
			headers: {
				'Content-Type': 'application/json',
			},
			status: 200,
		});
	} catch (error) {
		console.error('Error deleting employee:', error);
		return new Response(JSON.stringify({ message: 'An error occurred while deleting the employee.' }), {
			headers: {
				'Content-Type': 'application/json',
			},
			status: 500,
		});
	}
};
