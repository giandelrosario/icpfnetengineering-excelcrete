import Sidebar from '@/components/Sidebar';

// app/dashboard/layout.tsx
export default function BenefitsLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="flex">
			<Sidebar />
			{children}
		</section>
	);
}
