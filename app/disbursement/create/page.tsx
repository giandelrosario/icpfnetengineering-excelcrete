'use client';

import Button from '@/components/Button';
import api from '@/config/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { ArrowLeft, Plus, Trash2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

type TExpenseCategory = {
	id: number;
	title: string;
	description?: string;
};

type TCreateDisbursementItem = {
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

type TExpenseRow = {
	id: string;
	expense_category_id: string;
	amount: string;
};

const initialFormState: Omit<TCreateDisbursementRequest, 'expenses' | 'total_amount'> = {
	payee_name: '',
	address: '',
	tin_no: '',
	particulars: '',
	voucher_no: '',
	receipt_no: '',
	delivery_receipt_no: '',
	sales_invoice_no: '',
	disbursement_date: new Date().toISOString().slice(0, 10),
	description: '',
};

const initialExpenseRow = (): TExpenseRow => ({
	id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
	expense_category_id: '',
	amount: '',
});

const formatMoney = (value: number) =>
	new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);

const CreateDisbursement = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [formData, setFormData] = useState(initialFormState);
	const [expenseRows, setExpenseRows] = useState<TExpenseRow[]>([initialExpenseRow()]);
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState('Something went wrong. Please try again later.');

	const expense_categories_query = useQuery({
		queryKey: ['expense-categories'],
		queryFn: async () => {
			const response = await api.get('/disbursement/expense_category');
			return response.data as TExpenseCategory[];
		},
	});

	const createDisbursementMutation = useMutation({
		mutationFn: async (payload: TCreateDisbursementRequest) => {
			const response = await api.post('/disbursement', payload);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['disbursements'] });
			router.push('/disbursement');
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				const message = error.response?.data?.message || 'An error occurred while creating the disbursement.';
				setErrorMessage(message);
				setShowErrorModal(true);
				return;
			}

			setErrorMessage('An error occurred while creating the disbursement.');
			setShowErrorModal(true);
		},
	});

	const totalAmount = useMemo(() => {
		return expenseRows.reduce((sum, row) => {
			const parsed = Number(row.amount);
			return sum + (Number.isFinite(parsed) ? parsed : 0);
		}, 0);
	}, [expenseRows]);

	const addExpenseRow = () => {
		setExpenseRows((currentRows) => [...currentRows, initialExpenseRow()]);
	};

	const removeExpenseRow = (rowId: string) => {
		setExpenseRows((currentRows) => (currentRows.length === 1 ? currentRows : currentRows.filter((row) => row.id !== rowId)));
	};

	const updateExpenseRow = (rowId: string, field: keyof Omit<TExpenseRow, 'id'>, value: string) => {
		setExpenseRows((currentRows) => currentRows.map((row) => (row.id !== rowId ? row : { ...row, [field]: value })));
	};

	const handleSubmit = () => {
		const payeeName = formData.payee_name.trim();

		if (!payeeName) {
			setErrorMessage('Payee name is required.');
			setShowErrorModal(true);
			return;
		}

		if (expenseRows.length === 0) {
			setErrorMessage('Please add at least one expense item.');
			setShowErrorModal(true);
			return;
		}

		let validationMessage = '';
		const normalizedExpenses = expenseRows.map((row, index) => {
			const categoryId = Number(row.expense_category_id);
			const amount = Number(row.amount);

			if (!row.expense_category_id) {
				validationMessage = `Row ${index + 1}: Please select an expense category.`;
				return null;
			}

			if (!Number.isFinite(categoryId) || categoryId <= 0) {
				validationMessage = `Row ${index + 1}: Please select a valid expense category.`;
				return null;
			}

			if (!Number.isFinite(amount) || amount <= 0) {
				validationMessage = `Row ${index + 1}: Amount must be greater than zero.`;
				return null;
			}

			return {
				expense_category_id: categoryId,
				amount,
			};
		});

		if (validationMessage) {
			setErrorMessage(validationMessage);
			setShowErrorModal(true);
			return;
		}

		const payloadExpenses = normalizedExpenses.filter((expense): expense is TCreateDisbursementItem => expense !== null);

		if (payloadExpenses.length === 0) {
			setErrorMessage('Please add at least one valid expense item.');
			setShowErrorModal(true);
			return;
		}

		createDisbursementMutation.mutate({
			...formData,
			payee_name: payeeName,
			total_amount: totalAmount,
			expenses: payloadExpenses,
		});
	};

	if (expense_categories_query.isPending) {
		return (
			<main className="min-h-screen w-full bg-slate-50">
				<div className="mx-auto max-w-6xl p-4">
					<div className="animate-pulse space-y-4">
						<div className="h-8 w-1/3 rounded bg-slate-200" />
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
							{Array.from({ length: 8 }).map((_, index) => (
								<div key={index} className="h-12 rounded bg-slate-200" />
							))}
						</div>
					</div>
				</div>
			</main>
		);
	}

	if (expense_categories_query.isError) {
		return (
			<main className="min-h-screen w-full bg-slate-50">
				<div className="mx-auto max-w-6xl p-4">
					<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
						<p className="font-medium">Error loading expense categories</p>
						<p className="text-sm text-red-600">Please try again later.</p>
					</div>
				</div>
			</main>
		);
	}

	return (
		<>
			<main className="min-h-screen w-full bg-slate-50">
				<div className="mx-auto max-w-6xl space-y-4 p-4">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<button onClick={() => router.back()} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50">
								<ArrowLeft size={18} />
							</button>
							<div>
								<h1 className="text-lg font-medium text-slate-700">Create Disbursement</h1>
								<p className="text-sm text-slate-500">Add disbursement details and expense item breakdowns</p>
							</div>
						</div>
					</div>

					<div className="grid gap-4 lg:grid-cols-3">
						<div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 lg:col-span-2">
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">Payee Name</label>
									<input
										type="text"
										value={formData.payee_name}
										onChange={(event) => setFormData((current) => ({ ...current, payee_name: event.target.value }))}
										className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
										placeholder="Enter payee name"
									/>
								</div>
								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">Disbursement Date</label>
									<input
										type="date"
										value={formData.disbursement_date}
										onChange={(event) => setFormData((current) => ({ ...current, disbursement_date: event.target.value }))}
										className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
									/>
								</div>
								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">TIN No.</label>
									<input
										type="text"
										value={formData.tin_no}
										onChange={(event) => setFormData((current) => ({ ...current, tin_no: event.target.value }))}
										className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
										placeholder="Enter TIN number"
									/>
								</div>
								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">Voucher No.</label>
									<input
										type="text"
										value={formData.voucher_no}
										onChange={(event) => setFormData((current) => ({ ...current, voucher_no: event.target.value }))}
										className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
										placeholder="Enter voucher number"
									/>
								</div>
								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">Receipt No.</label>
									<input
										type="text"
										value={formData.receipt_no}
										onChange={(event) => setFormData((current) => ({ ...current, receipt_no: event.target.value }))}
										className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
										placeholder="Enter receipt number"
									/>
								</div>
								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">Delivery Receipt No.</label>
									<input
										type="text"
										value={formData.delivery_receipt_no}
										onChange={(event) => setFormData((current) => ({ ...current, delivery_receipt_no: event.target.value }))}
										className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
										placeholder="Enter delivery receipt number"
									/>
								</div>
								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">Sales Invoice No.</label>
									<input
										type="text"
										value={formData.sales_invoice_no}
										onChange={(event) => setFormData((current) => ({ ...current, sales_invoice_no: event.target.value }))}
										className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
										placeholder="Enter sales invoice number"
									/>
								</div>
							</div>

							<div>
								<label className="mb-1 block text-sm font-medium text-slate-700">Particulars</label>
								<input
									type="text"
									value={formData.particulars}
									onChange={(event) => setFormData((current) => ({ ...current, particulars: event.target.value }))}
									className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
									placeholder="Enter particulars"
								/>
							</div>

							<div>
								<label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
								<textarea
									value={formData.address}
									onChange={(event) => setFormData((current) => ({ ...current, address: event.target.value }))}
									rows={3}
									className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
									placeholder="Enter address"
								/>
							</div>

							<div>
								<label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
								<textarea
									value={formData.description}
									onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
									rows={3}
									className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
									placeholder="Enter description"
								/>
							</div>

							<div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
								<div className="flex items-center justify-between gap-2">
									<div>
										<h2 className="text-sm font-semibold text-slate-700">Expense Items</h2>
										<p className="text-xs text-slate-500">Select a category and set the amount for each line item.</p>
									</div>
									<Button
										onClick={addExpenseRow}
										text="Add Item"
										icon={{
											position: 'left',
											content: <Plus size={16} color="#fff" />,
										}}
									/>
								</div>

								<div className="mt-4 space-y-3">
									{expenseRows.map((row, index) => (
										<div
											key={row.id}
											className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_180px_44px] md:items-end"
										>
											<div>
												<label className="mb-1 block text-sm font-medium text-slate-700">Expense Category</label>
												<select
													value={row.expense_category_id}
													onChange={(event) => updateExpenseRow(row.id, 'expense_category_id', event.target.value)}
													className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
												>
													<option value="">Select category</option>
													{(expense_categories_query.data || []).map((category) => (
														<option key={category.id} value={category.id}>
															{category.title}
														</option>
													))}
												</select>
											</div>
											<div>
												<label className="mb-1 block text-sm font-medium text-slate-700">Amount</label>
												<input
													type="number"
													min="0"
													step="0.01"
													value={row.amount}
													onChange={(event) => updateExpenseRow(row.id, 'amount', event.target.value)}
													className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
													placeholder="0.00"
												/>
											</div>
											<button
												type="button"
												onClick={() => removeExpenseRow(row.id)}
												disabled={expenseRows.length === 1}
												className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
												title={`Remove item ${index + 1}`}
											>
												<Trash2 size={16} />
											</button>
										</div>
									))}
								</div>
							</div>
						</div>

						<div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
							<div>
								<p className="text-sm font-medium text-slate-700">Summary</p>
								<div className="mt-4 space-y-2 text-sm text-slate-600">
									<div className="flex items-center justify-between">
										<span>Items</span>
										<span className="font-medium text-slate-900">{expenseRows.length}</span>
									</div>
									<div className="flex items-center justify-between">
										<span>Total</span>
										<span className="font-semibold text-slate-900">PHP {formatMoney(totalAmount)}</span>
									</div>
								</div>
							</div>

							<div className="flex flex-col gap-3">
								<Button
									onClick={handleSubmit}
									text={createDisbursementMutation.isPending ? 'Saving...' : 'Save Disbursement'}
									disabled={createDisbursementMutation.isPending}
									icon={{
										position: 'left',
										content: <Plus size={16} color="#fff" />,
									}}
								/>
								<Button theme="outline" onClick={() => router.push('/disbursement')} text="Cancel" />
							</div>
						</div>
					</div>
				</div>
			</main>

			{showErrorModal ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowErrorModal(false)} />
					<div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
						<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
							<XCircle className="text-red-600" size={28} />
						</div>
						<div className="mt-4 text-center">
							<h2 className="text-lg font-semibold text-slate-900">Unable to save disbursement</h2>
							<p className="mt-2 text-sm text-slate-600">{errorMessage}</p>
						</div>
						<div className="mt-6 flex justify-center">
							<Button onClick={() => setShowErrorModal(false)} text="Close" theme="default" />
						</div>
					</div>
				</div>
			) : null}
		</>
	);
};

export default CreateDisbursement;
