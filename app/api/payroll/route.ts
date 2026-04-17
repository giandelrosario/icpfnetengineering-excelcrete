import { prisma } from '@/config/prisma';
import { verifyJwt } from '@/lib/jwt';
import { NextRequest, NextResponse } from 'next/server';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const GET = async (request: NextRequest) => {
	const authHeader = await request.headers.get('Authorization');
	const token = authHeader?.replace('Bearer ', '');
	const isVerified = await verifyJwt(token as string);

	if (!isVerified) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	const searchParams = request.nextUrl.searchParams;

	const status = searchParams.get('status') as string | undefined;

	const sss = searchParams.get('sss') as string | undefined;
	const philhealth = searchParams.get('philhealth') as string | undefined;
	const pagibig = searchParams.get('pagibig') as string | undefined;

	const pay_period = searchParams.get('pay_period') as string | undefined;
	const yearParam = searchParams.get('year') as string | undefined;
	const monthsParam = searchParams.get('months') as string | string[] | undefined;

	const parsedYear = yearParam ? Number(yearParam) : undefined;

	const monthValues = Array.isArray(monthsParam)
		? monthsParam
		: monthsParam
			? monthsParam
					.split(',')
					.map((month) => month.trim())
					.filter(Boolean)
			: [];
	const monthNamesFilter = monthValues.map((month) => monthNames[Number.parseInt(month, 10) - 1]).filter((name): name is string => Boolean(name));

	const selectedBenefitKeys = [
		{ key: 'sss', enabled: sss === 'true' },
		{ key: 'philhealth', enabled: philhealth === 'true' },
		{ key: 'pagibig', enabled: pagibig === 'true' },
	]
		.filter((benefit) => benefit.enabled)
		.map((benefit) => benefit.key);

	const shouldCheckPaidBenefits = pay_period !== 'half' && Boolean(parsedYear) && monthNamesFilter.length > 0 && selectedBenefitKeys.length > 0;

	const payrollLogsSelect = {
		where: shouldCheckPaidBenefits
			? {
					payroll_year: parsedYear as number,
					payroll_month: { in: monthNamesFilter },
					...(pay_period && { pay_period }),
				}
			: { id: -1 },
		select: {
			payroll_month: true,
			benefits: {
				select: {
					benefit_key: true,
				},
			},
		},
	};

	try {
		const employees = await prisma.employee.findMany({
			select: {
				id: true,
				first_name: true,
				middle_name: true,
				last_name: true,
				salary_history: {
					orderBy: { created_at: 'desc' },
				},
				sss_settings: true,
				philhealth_settings: true,
				pagibig_settings: true,
				bir_settings: true,
				payroll_logs: payrollLogsSelect,
			},
			where: {
				...(status && { status }),
			},
		});

		const employer_share = await prisma.employerShare.findFirst();

		const filteredEmployees = employees.filter((employee) => {
			if (sss === 'true' && !employee.sss_settings) return false;
			if (philhealth === 'true' && !employee.philhealth_settings) return false;
			if (pagibig === 'true' && !employee.pagibig_settings) return false;
			if (!shouldCheckPaidBenefits || !employee.payroll_logs) return true;

			const monthBenefits = new Map<string, Set<string>>();

			employee.payroll_logs.forEach((log) => {
				const benefitSet = monthBenefits.get(log.payroll_month) ?? new Set<string>();
				log.benefits.forEach((benefit) => benefitSet.add(benefit.benefit_key));
				monthBenefits.set(log.payroll_month, benefitSet);
			});

			const isFullyPaidForSelection = monthNamesFilter.every((monthName) => {
				const benefitSet = monthBenefits.get(monthName);
				return benefitSet ? selectedBenefitKeys.every((key) => benefitSet.has(key)) : false;
			});

			return !isFullyPaidForSelection;
		});

		const payload = await Promise.all(
			filteredEmployees.map(async (employee) => {
				const { payroll_logs: _payrollLogs, ...rest } = employee;
				const salaryHistory = employee.salary_history ?? [];
				const salary = salaryHistory.length > 0 ? (salaryHistory[0]?.amount ?? 0) : 0;

				const sss_table = await prisma.sSSTable.findFirst({
					where: {
						salary_range_from: { lte: salary },
						salary_range_to: { gte: salary },
					},
				});

				const sss_contribution = sss_table
					? {
							total_contribution: sss_table.er_ss + sss_table.er_mpf + sss_table.er_ec + sss_table.ee_ss + sss_table.ee_mpf,
						}
					: null;

				const philhealth_contribution = {
					total: (salary * ((employer_share?.philhealth_share ?? 0) + (employee.philhealth_settings?.ee_share ?? 0))) / 100,
					rate: (employer_share?.philhealth_share ?? 0) + (employee.philhealth_settings?.ee_share ?? 0),
				};
				const pagibig_contribution = {
					total: (employer_share?.pagibig_share ?? 0) + (employee.pagibig_settings?.ee_share ?? 0),
					rate: (employer_share?.pagibig_share ?? 0) + (employee.pagibig_settings?.ee_share ?? 0),
				};

				return {
					...rest,
					salary: salary,
					sss_settings: employee.sss_settings ? { ...employee.sss_settings, ...sss_contribution } : null,
					philhealth_settings: employee.philhealth_settings ? { ...employee.philhealth_settings, contribution: philhealth_contribution } : null,
					pagibig_settings: employee.pagibig_settings ? { ...employee.pagibig_settings, contribution: pagibig_contribution } : null,
				};
			}),
		);

		return new Response(JSON.stringify(payload), { status: 200 });
	} catch (error) {
		console.error('Error fetching employees for payroll:', error);
		return new Response(JSON.stringify({ error: 'An error occurred while fetching employees for payroll.' }), { status: 500 });
	}
};

export const POST = async (request: NextRequest) => {
	const body = await request.json();

	const authHeader = await request.headers.get('Authorization');
	const token = authHeader?.replace('Bearer ', '');
	const isVerified = await verifyJwt(token as string);

	if (!isVerified) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	const months = body.months;
	const year = body.year as number | undefined;
	const pay_period = body.pay_period as string | undefined;

	if (!body.employees || body.employees.length === 0) {
		return new Response(JSON.stringify({ message: 'No employees provided.' }), { status: 400 });
	}

	if (!months || months.length === 0) {
		return new Response(JSON.stringify({ message: 'No months provided.' }), { status: 400 });
	}

	if (!year) {
		return new Response(JSON.stringify({ message: 'No year provided.' }), { status: 400 });
	}

	if (!pay_period) {
		return new Response(JSON.stringify({ message: 'No pay period provided.' }), { status: 400 });
	}

	const pay = months?.map((month: string) => {
		const monthIndex = parseInt(month) - 1;

		const monthName = monthNames[monthIndex] || 'Unknown';

		const payrollLogsData = body.employees.map((employee: any) => ({
			employee_id: employee.id,
			title: `Payroll for ${monthName} ${year} - ${pay_period}`,
			gross_pay: employee.gross,
			net_pay: employee.net,
			payroll_month: monthName,
			payroll_year: year,
			pay_period,
			process_at: new Date(),
			...(employee.applied_benefits?.length
				? {
						benefits: {
							createMany: {
								data: employee.applied_benefits.map((benefit: any) => ({
									benefit_key: benefit.benefit_key,
									amount: benefit.amount,
									benefit_title: benefit.benefit_key,
								})),
							},
						},
					}
				: {}),
		}));
		return payrollLogsData;
	});

	try {
		await prisma.$transaction(
			pay.flat().map((log: any) =>
				prisma.payrollLogs.create({
					data: log,
				}),
			),
		);
		return new Response(JSON.stringify({ message: 'Payroll processed successfully.' }), { status: 200 });
	} catch (error) {
		console.error('Error processing payroll:', error);
		return new Response(JSON.stringify({ message: 'An error occurred while processing payroll.' }), { status: 500 });
	}
};
