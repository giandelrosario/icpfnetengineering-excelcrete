'use client';

import Button from '@/components/Button';
import api from '@/config/api';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, ReceiptText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

type TDisbursementExpense = {
	id: number;
	expense_category_id: number;
	amount: number;
	expense_category?: {
		id: number;
		title: string;
		description?: string;
	};
};

type TDisbursement = {
	id: number;
	payee_name?: string;
	address?: string;
	tin_no?: string;
	particulars?: string;
	voucher_no?: string;
	receipt_no?: string;
	delivery_receipt_no?: string;
	sales_invoice_no?: string;
	total_amount?: number;
	disbursement_date?: string;
	description?: string;
	created_at?: string;
	updated_at?: string;
	expenses?: TDisbursementExpense[];
};

const MONTH_OPTIONS = [
	{ value: '', label: 'All months' },
	{ value: '1', label: 'January' },
	{ value: '2', label: 'February' },
	{ value: '3', label: 'March' },
	{ value: '4', label: 'April' },
	{ value: '5', label: 'May' },
	{ value: '6', label: 'June' },
	{ value: '7', label: 'July' },
	{ value: '8', label: 'August' },
	{ value: '9', label: 'September' },
	{ value: '10', label: 'October' },
	{ value: '11', label: 'November' },
	{ value: '12', label: 'December' },
];

const MONTH_LABELS = MONTH_OPTIONS.filter((option) => option.value).map((option) => option.label);

const formatMoney = (value: number) =>
	new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);

const formatDate = (value?: string) => {
	if (!value) return '—';

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '—';

	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: '2-digit',
		year: 'numeric',
	}).format(date);
};

const toDateInputValue = (value?: string) => {
	if (!value) return '';

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';

	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const day = `${date.getDate()}`.padStart(2, '0');

	return `${year}-${month}-${day}`;
};

const Disbursement = () => {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedDate, setSelectedDate] = useState('');
	const [selectedMonth, setSelectedMonth] = useState('');
	const [selectedYear, setSelectedYear] = useState('');
	const [currentPage, setCurrentPage] = useState(1);

	const itemsPerPage = 10;

	const disbursements_query = useQuery({
		queryKey: ['disbursements'],
		queryFn: async () => {
			const response = await api.get('/disbursement');
			return response.data as TDisbursement[];
		},
	});

	const availableYears = useMemo(() => {
		const yearSet = new Set<string>();

		(disbursements_query.data || []).forEach((disbursement) => {
			const disbursementDate = disbursement.disbursement_date || disbursement.created_at;
			if (!disbursementDate) return;

			const year = new Date(disbursementDate).getFullYear();
			if (!Number.isNaN(year)) {
				yearSet.add(`${year}`);
			}
		});

		return Array.from(yearSet).sort((a, b) => Number(b) - Number(a));
	}, [disbursements_query.data]);

	const filteredDisbursements = useMemo(() => {
		const items = disbursements_query.data || [];
		const payeeSearch = searchTerm.trim().toLowerCase();

		return items.filter((disbursement) => {
			const disbursementDateValue = disbursement.disbursement_date || disbursement.created_at;
			const normalizedDate = toDateInputValue(disbursementDateValue);
			const disbursementDate = disbursementDateValue ? new Date(disbursementDateValue) : null;
			const disbursementMonth = disbursementDate ? `${disbursementDate.getMonth() + 1}` : '';
			const disbursementYear = disbursementDate ? `${disbursementDate.getFullYear()}` : '';

			if (selectedDate && normalizedDate !== selectedDate) return false;
			if (selectedMonth && disbursementMonth !== selectedMonth) return false;
			if (selectedYear && disbursementYear !== selectedYear) return false;
			if (payeeSearch && !disbursement.payee_name?.toLowerCase().includes(payeeSearch)) return false;

			return true;
		});
	}, [disbursements_query.data, searchTerm, selectedDate, selectedMonth, selectedYear]);

	const totalAmount = useMemo(() => {
		return filteredDisbursements.reduce((sum, disbursement) => sum + (Number(disbursement.total_amount) || 0), 0);
	}, [filteredDisbursements]);

	const monthTotalAmount = useMemo(() => {
		const monthFilter = selectedMonth || `${new Date().getMonth() + 1}`;
		const yearFilter = selectedYear || `${new Date().getFullYear()}`;

		return (disbursements_query.data || []).reduce((sum, disbursement) => {
			const disbursementDateValue = disbursement.disbursement_date || disbursement.created_at;
			if (!disbursementDateValue) return sum;

			const disbursementDate = new Date(disbursementDateValue);
			if (Number.isNaN(disbursementDate.getTime())) return sum;

			const disbursementMonth = `${disbursementDate.getMonth() + 1}`;
			const disbursementYear = `${disbursementDate.getFullYear()}`;

			if (disbursementMonth !== monthFilter || disbursementYear !== yearFilter) return sum;

			return sum + (Number(disbursement.total_amount) || 0);
		}, 0);
	}, [disbursements_query.data, selectedMonth, selectedYear]);

	const activeMonthLabel = selectedMonth ? MONTH_OPTIONS.find((option) => option.value === selectedMonth)?.label || 'Selected month' : 'This month';

	const yearlyExpenseGraph = useMemo(() => {
		const graphYear = selectedYear || `${new Date().getFullYear()}`;
		const totals = Array.from({ length: 12 }, () => 0);

		(disbursements_query.data || []).forEach((disbursement) => {
			const disbursementDateValue = disbursement.disbursement_date || disbursement.created_at;
			if (!disbursementDateValue) return;

			const disbursementDate = new Date(disbursementDateValue);
			if (Number.isNaN(disbursementDate.getTime())) return;

			if (`${disbursementDate.getFullYear()}` !== graphYear) return;

			totals[disbursementDate.getMonth()] += Number(disbursement.total_amount) || 0;
		});

		const maxAmount = Math.max(...totals, 0);

		return totals.map((amount, index) => ({
			label: MONTH_LABELS[index] || '',
			amount,
			height: maxAmount > 0 ? Math.max((amount / maxAmount) * 100, amount > 0 ? 8 : 0) : 0,
		}));
	}, [disbursements_query.data, selectedYear]);

	const graphYearLabel = selectedYear || `${new Date().getFullYear()}`;

	const totalPages = Math.max(1, Math.ceil(filteredDisbursements.length / itemsPerPage));
	const safeCurrentPage = Math.min(currentPage, totalPages);
	const paginatedDisbursements = filteredDisbursements.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);
	const pageStart = filteredDisbursements.length ? (safeCurrentPage - 1) * itemsPerPage + 1 : 0;
	const pageEnd = filteredDisbursements.length ? Math.min(safeCurrentPage * itemsPerPage, filteredDisbursements.length) : 0;

	const handleFilterChange = (setter: (value: string) => void, value: string) => {
		setter(value);
		setCurrentPage(1);
	};

	const resetFilters = () => {
		setSearchTerm('');
		setSelectedDate('');
		setSelectedMonth('');
		setSelectedYear('');
		setCurrentPage(1);
	};

	if (disbursements_query.isPending) {
		return (
			<main className="min-h-screen w-full bg-slate-50">
				<div className="mx-auto max-w-7xl p-4">
					<div className="animate-pulse space-y-4">
						<div className="h-8 w-1/3 rounded bg-slate-200" />
						<div className="h-12 rounded-lg bg-slate-200" />
						<div className="rounded-lg border border-slate-200 bg-white p-6">
							<div className="space-y-3">
								{Array.from({ length: 5 }).map((_, index) => (
									<div key={index} className="h-16 rounded bg-slate-100" />
								))}
							</div>
						</div>
					</div>
				</div>
			</main>
		);
	}

	if (disbursements_query.isError) {
		return (
			<main className="min-h-screen w-full bg-slate-50">
				<div className="mx-auto max-w-7xl p-4">
					<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
						<p className="font-medium">Error loading disbursements</p>
						<p className="text-sm text-red-600">Please try again later.</p>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen w-full bg-slate-50">
			<div className="mx-auto max-w-7xl space-y-4 p-4">
				<div className="flex flex-col gap-3 rounded-lg p-2  sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h1 className="text-lg font-medium text-slate-700">Disbursements</h1>
						<p className="text-sm text-slate-500">Review disbursement records and their expense breakdowns</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							theme="outline"
							onClick={() => router.push('/disbursement/expense_category')}
							text="Category"
							icon={{
								position: 'left',
								content: <Plus size={18} className="text-slate-900" />,
							}}
						/>
						<Button
							onClick={() => router.push('/disbursement/create')}
							text="Create Disbursement"
							icon={{
								position: 'left',
								content: <Plus size={18} color="#fff" />,
							}}
						/>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					<div className="rounded-lg border border-slate-200 bg-white p-4">
						<p className="text-xs uppercase tracking-wide text-slate-500">Total Amount</p>
						<p className="mt-2 text-2xl font-semibold text-slate-900">PHP {formatMoney(totalAmount)}</p>
					</div>
					<div className="rounded-lg border border-slate-200 bg-white p-4">
						<p className="text-xs uppercase tracking-wide text-slate-500">Total Amount {activeMonthLabel}</p>
						<p className="mt-2 text-2xl font-semibold text-slate-900">PHP {formatMoney(monthTotalAmount)}</p>
					</div>
					<div className="rounded-lg border border-slate-200 bg-white p-4">
						<p className="text-xs uppercase tracking-wide text-slate-500">Disbursements</p>
						<p className="mt-2 text-2xl font-semibold text-slate-900">{filteredDisbursements.length}</p>
					</div>
				</div>

				<div className="rounded-lg border border-slate-200 bg-white p-4">
					<div className="flex flex-col gap-1 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-sm font-semibold text-slate-700">Yearly Expenses</p>
							<p className="text-xs text-slate-500">Total disbursement amounts per month for {graphYearLabel}</p>
						</div>
						<p className="text-xs text-slate-500">Bars scale against the highest month of the year</p>
					</div>

					<div className="mt-4 flex h-72 items-end gap-2 overflow-x-auto pb-2">
						{yearlyExpenseGraph.map((month) => (
							<div key={month.label} className="flex min-w-16 flex-1 flex-col items-center justify-end gap-2">
								<div className="flex h-56 w-full items-end rounded-t-lg bg-slate-100 px-2">
									<div
										className="w-full rounded-t-lg bg-slate-800 transition-all"
										style={{ height: `${month.height}%` }}
										aria-label={`${month.label} ${formatMoney(month.amount)}`}
									/>
								</div>
								<p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{month.label.slice(0, 3)}</p>
								<p className="text-[11px] text-slate-600">{formatMoney(month.amount)}</p>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border border-slate-200 bg-white p-4">
					<div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
						<div>
							<p className="text-sm font-semibold text-slate-700">Filters</p>
							<p className="text-xs text-slate-500">Filter by payee name, date, month, and year</p>
						</div>
						<button onClick={resetFilters} className="self-start text-xs font-medium text-slate-500 transition hover:text-slate-700">
							Clear filters
						</button>
					</div>

					<div className="mt-4 grid gap-4 lg:grid-cols-12">
						<div className="relative lg:col-span-5">
							<label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Payee name</label>
							<Search className="absolute left-3 top-[2.1rem] text-slate-400" size={18} />
							<input
								type="text"
								placeholder="Search by payee name..."
								value={searchTerm}
								onChange={(event) => handleFilterChange(setSearchTerm, event.target.value)}
								className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
							/>
						</div>

						<div className="lg:col-span-2">
							<label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Date</label>
							<input
								type="date"
								value={selectedDate}
								onChange={(event) => handleFilterChange(setSelectedDate, event.target.value)}
								className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
							/>
						</div>

						<div className="lg:col-span-2">
							<label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Month</label>
							<select
								value={selectedMonth}
								onChange={(event) => handleFilterChange(setSelectedMonth, event.target.value)}
								className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
							>
								{MONTH_OPTIONS.map((option) => (
									<option key={option.value || 'all'} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>

						<div className="lg:col-span-3">
							<label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Year</label>
							<select
								value={selectedYear}
								onChange={(event) => handleFilterChange(setSelectedYear, event.target.value)}
								className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
							>
								<option value="">All years</option>
								{availableYears.map((year) => (
									<option key={year} value={year}>
										{year}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				<div className="overflow-hidden rounded-lg border border-slate-200 bg-white ">
					<div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
						<div>
							<p className="text-sm font-medium text-slate-700">Disbursement List</p>
							<p className="text-xs text-slate-500">
								Showing {pageStart} - {pageEnd} of {filteredDisbursements.length} records
							</p>
						</div>
						<ReceiptText className="text-slate-400" size={18} />
					</div>

					{filteredDisbursements.length === 0 ? (
						<div className="px-6 py-12 text-center">
							<p className="font-medium text-slate-700">No disbursements found</p>
							<p className="mt-1 text-sm text-slate-500">Try adjusting the filters or create a new disbursement.</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead>
									<tr className="border-b border-slate-200 bg-slate-50">
										<th className="px-6 py-3 font-semibold text-slate-700">Payee</th>
										<th className="px-6 py-3 font-semibold text-slate-700">Voucher / Receipt</th>
										<th className="px-6 py-3 font-semibold text-slate-700">Date</th>
										<th className="px-6 py-3 font-semibold text-slate-700">Items</th>
										<th className="px-6 py-3 text-right font-semibold text-slate-700">Total</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-200">
									{paginatedDisbursements.map((disbursement) => (
										<tr key={disbursement.id} className="align-top transition hover:bg-slate-50/80">
											<td className="px-6 py-4">
												<p className="font-medium text-slate-900">{disbursement.payee_name || 'Untitled disbursement'}</p>
												<p className="mt-1 text-xs text-slate-500">
													{disbursement.particulars || disbursement.description || 'No particulars provided'}
												</p>
											</td>
											<td className="px-6 py-4 text-slate-600">
												<p>{disbursement.voucher_no || '—'}</p>
												<p className="mt-1 text-xs text-slate-500">{disbursement.receipt_no || disbursement.sales_invoice_no || '—'}</p>
											</td>
											<td className="px-6 py-4 text-slate-600">{formatDate(disbursement.disbursement_date || disbursement.created_at)}</td>
											<td className="px-6 py-4">
												{(disbursement.expenses || []).length === 0 ? (
													<span className="text-slate-500">—</span>
												) : (
													<div className="flex flex-wrap gap-2">
														{disbursement.expenses?.map((expense) => (
															<span
																key={expense.id}
																className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
															>
																{expense.expense_category?.title || 'Uncategorized'}
																<span className="text-slate-500">{formatMoney(Number(expense.amount) || 0)}</span>
															</span>
														))}
													</div>
												)}
											</td>
											<td className="px-6 py-4 text-right font-semibold text-slate-900">{formatMoney(Number(disbursement.total_amount) || 0)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{filteredDisbursements.length > 0 ? (
						<div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
							<span>
								Showing {pageStart} - {pageEnd} of {filteredDisbursements.length}
							</span>
							<div className="flex items-center gap-2">
								<button
									disabled={safeCurrentPage === 1}
									onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
									className="rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Previous
								</button>
								<span className="text-xs text-slate-600">
									Page {safeCurrentPage} of {totalPages}
								</span>
								<button
									disabled={safeCurrentPage === totalPages}
									onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
									className="rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Next
								</button>
							</div>
						</div>
					) : null}
				</div>
			</div>
		</main>
	);
};

export default Disbursement;
