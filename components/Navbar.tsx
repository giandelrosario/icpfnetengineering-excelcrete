'use client';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export const scrollToSection = (id: string) => {
	const element = document.getElementById(id);
	if (element) {
		window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' }); // Adjust for navbar height
	}
};

const Navbar = ({ explicit = false }: { explicit?: boolean }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const [links, _setLinks] = useState([
		{ name: 'About', href: 'about' },
		{ name: 'Services', href: 'services' },
		{ name: 'Projects', href: 'projects' },
	]);

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	return (
		<>
			{explicit ? (
				<nav className={`bg-slate-50/10 backdrop-blur-lg z-40 sticky top-0`}>
					<div className="w-full bg-blue-700">
						<div className="container mx-auto flex justify-between items-center py-2 px-6 text-sm text-slate-50">
							<div className="flex items-center gap-2">
								<p>044-797-7554 • 044-712-2055</p>
								<p>inquiry@icpfnetengineering.com</p>
							</div>
							<div>
								<p>Andres Bijasa Rd. Brgy. Gaya-Gaya, San Jose del Monte, Bulacan, 3023</p>
							</div>
						</div>
					</div>
					<div className="container flex items-center justify-between mx-auto py-2 px-6">
						{/* Logo */}
						<a href="#hero" className="shrink-0">
							<img src={'/logo/short-logo-blue-transparent.png'} alt="ICPFNET Logo" className="h-16 md:h-18 w-auto" />
						</a>

						{/* Desktop Navigation */}
						<ul className="hidden md:flex md:space-x-8 items-center">
							{links.map((link) => (
								<li key={link.name}>
									<button
										onClick={() => scrollToSection(link.href)}
										className="text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors duration-300 hover:cursor-pointer"
									>
										{link.name}
									</button>
								</li>
							))}
						</ul>

						{/* Desktop Contact Button */}
						<a
							href="#contact"
							className="hidden md:block px-5 py-2 rounded-full font-medium text-sm bg-blue-800 text-slate-50 hover:bg-yellow-400 hover:text-blue-900 transition-colors duration-300"
						>
							Contact Us
						</a>

						{/* Mobile Menu Button */}
						<button onClick={toggleMenu} className="md:hidden p-2 rounded-lg hover:bg-slate-200/50 transition-colors" aria-label="Toggle menu">
							{isMenuOpen ? <X size={24} className="text-slate-700" /> : <Menu size={24} className="text-slate-700" />}
						</button>
					</div>

					{/* Mobile Menu */}
					<div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
						<div className="container mx-auto px-6 pb-4">
							<ul className="flex flex-col space-y-4">
								{links.map((link) => (
									<li key={link.name}>
										<button
											onClick={() => {
												scrollToSection(link.href.substring(1)); // Remove the '#' from href
												setIsMenuOpen(false);
											}}
											className="block text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors duration-300"
										>
											{link.name}
										</button>
									</li>
								))}
								<li>
									<a
										href="#contact"
										className="block w-full text-center px-5 py-2 rounded-full font-medium text-sm bg-blue-800 text-slate-50 hover:bg-yellow-400 hover:text-blue-900 transition-colors duration-300"
										onClick={() => setIsMenuOpen(false)}
									>
										Contact Us
									</a>
								</li>
							</ul>
						</div>
					</div>
				</nav>
			) : (
				<nav className={`bg-slate-50/10 backdrop-blur-lg z-40 sticky top-0`}>
					<div className="container flex items-center justify-between mx-auto py-4 px-6">
						{/* Logo */}
						<Link href="/" className="shrink-0">
							<img src={'/logo/short-logo-blue-transparent.png'} alt="ICPFNET Logo" className="h-12 md:h-16 w-auto" />
						</Link>
					</div>
				</nav>
			)}
		</>
	);
};

export default Navbar;
