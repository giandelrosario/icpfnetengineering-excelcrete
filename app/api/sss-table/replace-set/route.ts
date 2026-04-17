import { NextRequest, NextResponse } from 'next/server';
import { SSSRowInput } from '@/lib/sss_table_2025';
import { prisma } from '@/config/prisma';
import { verifyJwt } from '@/lib/jwt';

const normalizeRow = (row: Record<string, unknown>, index: number): SSSRowInput => {
	const toNumber = (value: unknown, fieldName: string) => {
		const parsed = Number(value);
		if (!Number.isFinite(parsed)) {
			throw new Error(`Row ${index + 1}: ${fieldName} must be a valid number.`);
		}
		return parsed;
	};

	return {
		salary_range_from: toNumber(row.salary_range_from, 'salary_range_from'),
		salary_range_to: toNumber(row.salary_range_to, 'salary_range_to'),
		msc_ss: toNumber(row.msc_ss, 'msc_ss'),
		msc_mpf: toNumber(row.msc_mpf, 'msc_mpf'),
		er_ss: toNumber(row.er_ss, 'er_ss'),
		er_mpf: toNumber(row.er_mpf, 'er_mpf'),
		er_ec: toNumber(row.er_ec, 'er_ec'),
		ee_ss: toNumber(row.ee_ss, 'ee_ss'),
		ee_mpf: toNumber(row.ee_mpf, 'ee_mpf'),
	};
};

export const PUT = async (request: NextRequest, ctx: RouteContext<'/api/sss-table/replace-set'>) => {
	const body = await request.json();
	const candidateRows = Array.isArray(body) ? body : body?.rows;

	const authHeader = await request.headers.get('Authorization');
	const token = authHeader?.replace('Bearer ', '');
	const isVerified = await verifyJwt(token as string);

	if (!isVerified) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	if (!Array.isArray(candidateRows) || candidateRows.length === 0) {
		return new Response(JSON.stringify({ message: 'Invalid rows payload. Expected a non-empty array of rows.' }), {
			status: 400,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}

	let rows: SSSRowInput[];

	try {
		rows = candidateRows.map((row: unknown, index) => {
			if (!row || typeof row !== 'object') {
				throw new Error(`Row ${index + 1}: invalid object payload.`);
			}

			return normalizeRow(row as Record<string, unknown>, index);
		});
	} catch (error) {
		return new Response(JSON.stringify({ message: error instanceof Error ? error.message : 'Invalid rows payload.' }), {
			status: 400,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}

	const sortedRows = [...rows].sort((a, b) => a.salary_range_from - b.salary_range_from);

	for (let index = 0; index < sortedRows.length; index += 1) {
		const row = sortedRows[index];
		if (!row) continue;
		const previousRow = index > 0 ? sortedRows[index - 1] : undefined;

		if (row.salary_range_from > row.salary_range_to) {
			return new Response(JSON.stringify({ message: `Row ${index + 1}: salary_range_from cannot be greater than salary_range_to.` }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}

		if (previousRow && row.salary_range_from <= previousRow.salary_range_to) {
			return new Response(JSON.stringify({ message: `Row ${index + 1}: salary ranges must not overlap.` }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}
	}

	try {
		await prisma.$transaction([
			prisma.sSSTable.deleteMany(),
			prisma.sSSTable.createMany({
				data: sortedRows,
			}),
		]);

		return new Response(
			JSON.stringify({
				message: 'SSS table set replaced successfully.',
				count: sortedRows.length,
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
				},
			},
		);
	} catch (error) {
		console.error('Error replacing SSS table set:', error);
		return new Response(JSON.stringify({ message: 'An error occurred while replacing SSS table set.' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
};
