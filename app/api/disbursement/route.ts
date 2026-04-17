import { prisma } from '@/config/prisma';
import { verifyJwt } from '@/lib/jwt';
import { NextResponse } from 'next/server';

type TCreateDisbursementItem = {
	disbursement_id: number;
	expense_category_id: number;
	amount: number;
};

type TCreateDisbursementRequest = {
	payee_name: string;
	address: string;
	tin_no: string;
	particulars: string;
	voucher_no: string;
	receipt_no: string;
	delivery_receipt_no: string;
	sales_invoice_no: string;
	total_amount: number;
	disbursement_date: string;
	description: string;
	expenses: TCreateDisbursementItem[];
};

export const GET = async (request: Request) => {
	const authHeader = await request.headers.get('Authorization');
	const token = authHeader?.replace('Bearer ', '');
	const isVerified = await verifyJwt(token as string);

	if (!isVerified) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}
	try {
		const disbursements = await prisma.disbursement.findMany({
			include: {
				expenses: {
					include: {
						expense_category: true,
					},
				},
			},
		});

		return new Response(JSON.stringify(disbursements), { status: 200 });
	} catch (error) {
		console.error('Error fetching disbursements:', error);
		return new Response(JSON.stringify({ message: 'An error occurred while fetching disbursements.' }), { status: 500 });
	}
};

export const POST = async (request: Request) => {
	const authHeader = await request.headers.get('Authorization');
	const token = authHeader?.replace('Bearer ', '');
	const isVerified = await verifyJwt(token as string);

	if (!isVerified) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}
	try {
		const body = (await request.json()) as TCreateDisbursementRequest;

		const disbursement = await prisma.disbursement.create({
			data: {
				payee_name: body.payee_name,
				address: body.address,
				tin_no: body.tin_no,
				particulars: body.particulars,
				voucher_no: body.voucher_no,
				receipt_no: body.receipt_no,
				delivery_receipt_no: body.delivery_receipt_no,
				sales_invoice_no: body.sales_invoice_no,
				total_amount: body.total_amount,
				disbursement_date: new Date(body.disbursement_date),
				description: body.description,
				expenses: {
					createMany: {
						data: body.expenses.map((expense) => ({
							expense_category_id: expense.expense_category_id,
							amount: expense.amount,
						})),
					},
				},
			},
		});

		return new Response(JSON.stringify(disbursement), { status: 201 });
	} catch (error) {
		console.error('Error creating disbursement:', error);
		return new Response(JSON.stringify({ message: 'An error occurred while creating the disbursement.' }), { status: 500 });
	}
};
