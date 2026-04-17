import { prisma } from '@/config/prisma';
import { verifyJwt } from '@/lib/jwt';
import { NextRequest, NextResponse } from 'next/server';
type TCreateExpenseCategory = {
	title: string;
	description?: string;
};

export const GET = async (request: NextRequest) => {
	const authHeader = await request.headers.get('Authorization');
	const token = authHeader?.replace('Bearer ', '');
	const isVerified = await verifyJwt(token as string);

	if (!isVerified) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}
	try {
		const expenseCategories = await prisma.expenseCategory.findMany({});
		return new Response(JSON.stringify(expenseCategories), { status: 200 });
	} catch (error) {
		console.error('Error fetching expense categories:', error);
		return new Response(JSON.stringify({ message: 'An error occurred while fetching expense categories.' }), { status: 500 });
	}
};

export const POST = async (request: NextRequest) => {
	const authHeader = await request.headers.get('Authorization');
	const token = authHeader?.replace('Bearer ', '');
	const isVerified = await verifyJwt(token as string);

	if (!isVerified) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}
	try {
		const body = (await request.json()) as TCreateExpenseCategory;

		// Validate required fields
		if (!body.title) {
			return new Response(JSON.stringify({ message: 'Title is required.' }), { status: 400 });
		}

		const expenseCategory = await prisma.expenseCategory.create({
			data: {
				title: body.title,
				description: body.description,
			},
		});

		return new Response(JSON.stringify(expenseCategory), { status: 201 });
	} catch (error) {
		console.error('Error creating expense category:', error);
		return new Response(JSON.stringify({ message: 'An error occurred while creating the expense category.' }), { status: 500 });
	}
};
