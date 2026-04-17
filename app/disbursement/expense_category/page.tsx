'use client';

import Button from '@/components/Button';
import api from '@/config/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { ArrowLeft, Plus, Search, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

type TCreateExpenseCategory = {
	title: string;
	description?: string;
};

type TExpenseCategory = {
	id: number;
	title: string;
	description?: string;
	created_at: string;
	updated_at: string;
};

const initialFormState: TCreateExpenseCategory = {
	title: '',
	description: '',
};

const formatDate = (value: string) => {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return '—';

	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: '2-digit',
		year: 'numeric',
	}).format(date);
};

const ExpenseCategoryPage = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [searchTerm, setSearchTerm] = useState('');
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [formData, setFormData] = useState<TCreateExpenseCategory>({ ...initialFormState });
	const [errorMessage, setErrorMessage] = useState('Something went wrong. Please try again later.');
	const [showErrorModal, setShowErrorModal] = useState(false);

	const expense_categories_query = useQuery({
		queryKey: ['expense-categories'],
		queryFn: async () => {
			const response = await api.get('/disbursement/expense_category');
			return response.data as TExpenseCategory[];
		},
	});

	const createExpenseCategoryMutation = useMutation({
		mutationFn: async (payload: TCreateExpenseCategory) => {
			const response = await api.post('/disbursement/expense_category', payload);
			return response.data as TExpenseCategory;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
			setIsCreateModalOpen(false);
			setFormData({ ...initialFormState });
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				const message = error.response?.data?.message || 'An error occurred while creating the expense category.';
				setErrorMessage(message);
				setShowErrorModal(true);
				return;
			}

			setErrorMessage('An error occurred while creating the expense category.');
			setShowErrorModal(true);
		},
	});

	const categories = (expense_categories_query.data || [])
		.filter((category) => {
			if (!searchTerm.trim()) return true;

			const normalizedSearch = searchTerm.toLowerCase();
			return category.title.toLowerCase().includes(normalizedSearch) || category.description?.toLowerCase().includes(normalizedSearch) || false;
		})
		.sort((a, b) => {
			return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
		});

	const handleOpenCreateModal = () => {
		setFormData({ ...initialFormState });
		setIsCreateModalOpen(true);
	};

	const handleCloseCreateModal = () => {
		if (createExpenseCategoryMutation.isPending) return;

		setIsCreateModalOpen(false);
		setFormData({ ...initialFormState });
	};

	const handleCreateExpenseCategory = () => {
		const title = formData.title.trim();
		const description = formData.description?.trim();

		if (!title) {
			setErrorMessage('Title is required.');
			setShowErrorModal(true);
			return;
		}

		createExpenseCategoryMutation.mutate({
			title,
			description: description || undefined,
		});
	};

	if (expense_categories_query.isPending) {
		return (
			<main className="min-h-screen w-full bg-slate-50">
				<div className="mx-auto max-w-6xl p-4">
					<div className="animate-pulse space-y-4">
						<div className="h-8 w-1/3 rounded bg-slate-200" />
						<div className="h-12 rounded-lg bg-slate-200" />
						<div className="rounded-lg border border-slate-200 bg-white p-6">
							<div className="space-y-3">
								{Array.from({ length: 4 }).map((_, index) => (
									<div key={index} className="h-14 rounded bg-slate-100" />
								))}
							</div>
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
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div className="flex items-center gap-3">
							<button onClick={() => router.back()} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50">
								<ArrowLeft size={18} />
							</button>
							<div>
								<h1 className="text-lg font-medium text-slate-700">Expense Categories</h1>
								<p className="text-sm text-slate-500">Create and manage disbursement expense categories</p>
							</div>
						</div>
						<Button
							onClick={handleOpenCreateModal}
							text="Create Category"
							icon={{
								position: 'left',
								content: <Plus size={18} color="#fff" />,
							}}
						/>
					</div>

					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
						<input
							type="text"
							placeholder="Search by title or description..."
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
						/>
					</div>

					<div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
						<div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
							<div>
								<p className="text-sm font-medium text-slate-700">Category List</p>
								<p className="text-xs text-slate-500">
									{categories.length} record{categories.length === 1 ? '' : 's'}
								</p>
							</div>
						</div>

						{categories.length === 0 ? (
							<div className="px-6 py-12 text-center">
								<p className="font-medium text-slate-700">No expense categories found</p>
								<p className="mt-1 text-sm text-slate-500">{searchTerm ? 'Try a different search term.' : 'Create your first category to get started.'}</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-sm">
									<thead>
										<tr className="border-b border-slate-200 bg-slate-50">
											<th className="px-6 py-3 font-semibold text-slate-700">Title</th>
											<th className="px-6 py-3 font-semibold text-slate-700">Description</th>
											<th className="px-6 py-3 font-semibold text-slate-700">Created</th>
											<th className="px-6 py-3 font-semibold text-slate-700">Updated</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-200">
										{categories.map((category) => (
											<tr key={category.id} className="transition hover:bg-slate-50/80">
												<td className="px-6 py-4 font-medium text-slate-900">{category.title || 'Untitled'}</td>
												<td className="px-6 py-4 text-slate-600">{category.description || '—'}</td>
												<td className="px-6 py-4 text-slate-600">{formatDate(category.created_at)}</td>
												<td className="px-6 py-4 text-slate-600">{formatDate(category.updated_at)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</main>

			{isCreateModalOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseCreateModal} />
					<div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-lg font-semibold text-slate-900">Create Expense Category</p>
								<p className="mt-1 text-sm text-slate-500">Add a category that can be used for disbursement expenses.</p>
							</div>
							<button
								onClick={handleCloseCreateModal}
								disabled={createExpenseCategoryMutation.isPending}
								className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<XCircle size={20} />
							</button>
						</div>

						<div className="mt-6 space-y-4">
							<div>
								<label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
								<input
									type="text"
									value={formData.title}
									onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
									placeholder="Example: Transportation"
									className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
								/>
							</div>

							<div>
								<label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
								<textarea
									value={formData.description}
									onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
									placeholder="Optional details about this category"
									rows={4}
									className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
								/>
							</div>
						</div>

						<div className="mt-6 flex items-center justify-end gap-3">
							<button
								onClick={handleCloseCreateModal}
								disabled={createExpenseCategoryMutation.isPending}
								className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								onClick={handleCreateExpenseCategory}
								disabled={createExpenseCategoryMutation.isPending}
								className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{createExpenseCategoryMutation.isPending ? 'Saving...' : 'Save Category'}
							</button>
						</div>
					</div>
				</div>
			) : null}

			{showErrorModal ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowErrorModal(false)} />
					<div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
						<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
							<XCircle className="text-red-600" size={28} />
						</div>
						<div className="mt-4 text-center">
							<h2 className="text-lg font-semibold text-slate-900">Unable to save category</h2>
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

export default ExpenseCategoryPage;
