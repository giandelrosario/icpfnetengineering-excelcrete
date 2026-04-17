'use client';
import Link from 'next/link';
import { scrollToSection } from '@/components/Navbar';
import { useState } from 'react';

const Footer = () => {
	const [links, _] = useState([
		{ name: 'Home', href: 'hero' },
		{ name: 'About', href: 'about' },
		{ name: 'Services', href: 'services' },
		{ name: 'Projects', href: 'projects' },
	]);
	return (
		<footer className="bg-slate-50">
			<div className="mx-auto container p-4 py-6 lg:py-8">
				<div className="container flex flex-col items-center justify-between px-6 py-8 mx-auto lg:flex-row">
					<div className="flex flex-wrap items-center justify-center gap-4 mt-6 lg:gap-6 lg:mt-0">
						{links.map((link) => (
							<button
								key={link.name}
								onClick={() => scrollToSection(link.href)}
								className="text-sm font-medium text-slate-500 transition-colors duration-300 hover:text-blue-900"
							>
								{link.name}
							</button>
						))}
					</div>

					<p className="mt-6 text-sm text-gray-500 lg:mt-0">
						© {new Date().getFullYear()}{' '}
						<Link href="/" className="hover:underline">
							ICP-FNET Engineering
						</Link>
						. All Rights Reserved.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
