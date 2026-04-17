'use client';
import Footer from '@/components/Footer';
import Navbar, { scrollToSection } from '@/components/Navbar';
import { AnimatedGridPattern } from '@/components/ui/AnimatedGridPattern';
import { Building, Eye, Fence, FolderKanban, Hammer, Layers, Mail, MapPin, Phone, Tally3, Wrench } from 'lucide-react';

const missions = [
	{
		id: 1,
		icon: <Building size={16} className="text-blue-900" />,
		title: 'Technical Education',
		description: 'To educate and train technical personnel who will be knowledgeable and competent in the construction field to deliver quality infrastructure and help in Nation Building.',
	},
	{
		id: 2,
		icon: <Layers size={16} className="text-blue-900" />,
		title: 'Economical Engineering',
		description: 'To offer economical engineering solutions without sacrificing infrastructure quality.',
	},
	{
		id: 3,
		icon: <Tally3 size={16} className="text-blue-900" />,
		title: 'Modernization',
		description: 'To shift from conventional to precast/pre-stressed construction.',
	},
];

const services = [
	{
		id: 1,
		icons: <Wrench size={16} className="text-blue-900" />,
		title: 'General Engineering',
		description: 'We provide comprehensive civil and structural engineering solutions, overseeing projects from initial concept to final execution.',
	},
	{
		id: 2,
		icons: <Layers size={16} className="text-blue-900" />,
		title: 'Pre-casting & Post-tensioning',
		description: 'We utilize advanced post-tensioning techniques to enhance the strength and durability of concrete structures.',
	},
	{
		id: 3,
		icons: <Tally3 size={16} className="text-blue-900" />,
		title: 'Bridges, Roads, and Drainage Construction',
		description: 'Our expertise lies in developing critical public infrastructure, ranging from heavy-duty highway systems to complex drainage networks.',
	},
	{
		id: 4,
		icons: <Hammer size={16} className="text-blue-900" />,
		title: 'On-site Girder Fabrication',
		description: 'To eliminate the logistical challenges of transporting massive components, we offer specialized on-site girder fabrication.',
	},
	{
		id: 5,
		icons: <Fence size={16} className="text-blue-900" />,
		title: 'MSE Walls Fabrication',
		description: 'We design and fabricate Mechanically Stabilized Earth (MSE) walls directly at the project location.',
	},
];

const Home = () => {
	return (
		<>
			<section className="relative min-h-dvh flex flex-col w-full">
				<Navbar explicit />
				{/* Hero Section */}
				<div className={`min-h-160 flex flex-row items-center justify-center w-full py-2`}>
					<AnimatedGridPattern className="min-h-160 -z-10 inset-x-0 inset-y-[-30%] fill-sky-900/90 stroke-sky-800/10" x={-2} y={-2} />
					<div id="hero" className=" w-full flex flex-col lg:flex-row items-center justify-between px-2 py-2 container mx-auto">
						<div className="w-full lg:w-1/2">
							<div className="flex flex-col items-center justify-center lg:items-start lg:max-w-lg">
								<div className="rounded-full bg-linear-to-r from-blue-300/40 to-blue-300/30 py-1.5 px-3 flex items-center gap-2 mb-5">
									<Building size={16} className="text-sky-700" />{' '}
									<p className="text-xs lg:text-sm font-medium text-transparent bg-linear-to-r from-blue-600/80 via-sky-800/80 to-blue-700/90 bg-clip-text">
										Engineering Excellence Since 2002
									</p>
								</div>

								<div className="space-y-4 text-center lg:text-start">
									<div className="max-w-3xl">
										<span className="block text-3xl font-bold text-blue-950">Building the future on a </span>
										<span className="mt-1 text-6xl font-bold block text-transparent bg-linear-to-r from-blue-900 via-sky-700 to-sky-800 bg-clip-text">
											Foundation of Excellence.
										</span>
									</div>

									<p className="max-w-xl text-base leading-6 text-slate-600 sm:text-md lg:text-start">
										ICP-FNET Engineering delivers dependable general engineering, roadworks, drainage, precast, and post-tensioning solutions for public and
										private infrastructure projects.
									</p>
								</div>

								<div className="flex justify-start items-center gap-2 mt-2">
									<button
										className="flex gap-2 items-center w-full px-5 py-2 mt-6 text-sm text-blue-950 font-medium transition-colors border border-slate-500 duration-300 transform bg-white rounded-full lg:w-auto hover:bg-yellow-300 hover:text-blue-900 hover:border-yellow-400 focus:outline-none focus:border-blue-700 focus:bg-blue-700 focus:text-white"
										onClick={() => scrollToSection('projects')}
									>
										<FolderKanban size={16} />
										<span>Explore our Projects</span>
									</button>
								</div>
							</div>
						</div>
						<div className="flex items-center justify-center w-full mt-6 lg:mt-0 lg:w-1/2">
							<div className="grid grid-cols-2 gap-2 lg:gap-4 w-full lg:max-w-3xl">
								<div className="h-58 w-auto">
									<img
										className="hover:scale-105 transition w-full h-full object-cover rounded-2xl shadow-2xl shadow-slate-300"
										src="/images/projects/daang-hari-molino-flyover.jpeg"
										alt="Project 1"
									/>
								</div>
								<div className="h-58 w-auto">
									<img
										className="hover:scale-105 transition w-full h-full object-cover rounded-2xl shadow-2xl shadow-blue-300"
										src="/images/projects/cavite.jpeg"
										alt="Project 2"
									/>
								</div>
								<div className="h-58 w-auto">
									<img
										className="hover:scale-105 transition w-full h-full object-cover rounded-2xl shadow-2xl shadow-blue-300"
										src="/images/projects/kaytutong-bridge.jpeg"
										alt="Project 3"
									/>
								</div>
								<div className="h-58 w-auto">
									<img
										className="hover:scale-105 transition w-full h-full object-cover rounded-2xl shadow-2xl shadow-slate-300"
										src="/images/projects/slex-tr4-underpass.jpeg"
										alt="Project 4"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="py-5 bg-slate-100 w-full"></div>

				{/* services */}
				<div id="services" className="bg-white">
					<div className="container py-8 px-4 mx-auto sm:py-12 lg:px-6">
						<div className="max-w-2xl mx-auto text-center mb-8 lg:mb-16">
							<h2 className="mb-4 text-2xl md:text-4xl tracking-tight font-extrabold text-blue-950">Our Services</h2>
							<p className="text-gray-500 sm:text-md">
								We are experts in general engineering, roads, and drainage, providing innovative pre-casting and post-tensioning solutions to streamline construction.
							</p>
						</div>
						<div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-4">
							{services.map((service) => (
								<div
									key={service.id}
									className="group bg-slate-50 p-6 rounded-2xl hover:bg-blue-800 hover:-translate-y-2 transition-all duration-150 flex flex-col items-start text-start"
								>
									<div className="flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-white lg:h-12 lg:w-12">{service.icons}</div>
									<h3 className="mb-2 text-xl font-bold text-slate-700 transition-colors group-hover:text-white">{service.title}</h3>
									<p className="text-gray-500 transition-colors group-hover:text-white">{service.description}</p>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* about section */}
				<div id="about" className="bg-white min-h-screen">
					<div className="container mx-auto px-6 py-8 lg:my-10 flex flex-col justify-around items-center gap-12">
						<div className="w-full flex flex-col lg:flex-row gap-10">
							<div className="p-2">
								<img className="hidden lg:block lg:max-w-80 object-cover rounded-4xl" src="/logo/logo-blue-white.png" alt="office content 2" />
								<img className="w-full lg:hidden object-cover rounded-4xl" src="/logo/short-logo-blue-white.png" alt="office content 2" />
							</div>
							<div className="group bg-slate-50 p-8 rounded-2xl hover:bg-blue-800 transition-all text-gray-500 sm:text-md max-w-2xl mt-12 lg:mt-0 flex flex-col justify-center items-center lg:items-start text-center lg:text-start">
								<div className="flex flex-col items-start justify-start">
									<h2 className="mb-3 text-4xl tracking-tight font-extrabold text-blue-950 group-hover:text-white">Get to know us</h2>
									<div className="max-w-40 w-full h-1 bg-linear-to-r from-yellow-400 to-yellow-300  rounded-full mb-2"></div>
								</div>
								<p className="mt-6 text-slate-500 group-hover:text-white">
									<span className="font-semibold">ICP-FNET ENGINEERING</span>, is a single proprietorship business entity established on August 2002 as ICP
									Construction and Supply organized and registered under the law of the Philippines with the Department of Trade and Industry (DTI).
								</p>
								<p className="mt-4 text-slate-500 group-hover:text-white">
									We are into General Engineering, Pre-casting/Post-tensioning, on-site Girder Fabrication. In collaboration with Reinforced Earth Company, we also
									do MSE Walls fabrication and installation. Our work interest also includes the Construction of Bridge, Roads, Drainage and Water Supply.
								</p>
							</div>
						</div>

						{/* Mission & Vision Section */}
						<div className="mt-16 space-y-16">
							{/* Mission Section */}
							<div className="relative">
								<div className="text-center mb-12">
									<h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 mb-4">Our Mission</h2>
									<div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
								</div>

								<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
									{missions.map((item, idx) => (
										<div key={idx} className="group relative bg-slate-50 hover:bg-blue-800 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2">
											<div className="relative space-y-4">
												{/* Icon */}
												<div className="w-16 h-16 bg-white text-white rounded-full flex items-center justify-center transition-transform duration-300">
													{item.icon}
												</div>

												{/* Title */}
												<h4 className="text-xl font-bold text-gray-900 group-hover:text-white transition-colors">{item.title}</h4>

												{/* Description */}
												<p className="text-gray-600 group-hover:text-white leading-relaxed">{item.description}</p>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Vision Section */}
							<div className="relative">
								<div className="bg-blue-800 rounded-2xl  shadow-2xl overflow-hidden">
									<div className="relative text-center space-y-6">
										<AnimatedGridPattern className="min-h-300 z-10 fill-blue-400/90 stroke-blue-100/10" />
										<div className="p-12 lg:p-16">
											<div className="inline-block">
												<div className="p-2 md:p-5 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
													<Eye size={32} className="text-white" />
												</div>
											</div>

											<h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Our Vision</h2>

											<div className="w-24 h-1 bg-linear-to-r from-yellow-400 to-yellow-300 mx-auto rounded-full mb-6"></div>

											<p className="text-md md:text-lg text-blue-50 max-w-3xl mx-auto leading-relaxed font-medium">
												Upgrading construction workmanship by adopting new technologies and innovations to improve quality of our infrastructure.
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* contact us section */}
				<div id="contact" className="container px-6 py-12 mx-auto">
					<div className="text-center">
						<h1 className="mt-4 text-2xl font-extrabold text-blue-950 md:text-4xl ">Contact Us</h1>

						<p className="mt-2 text-gray-500">Our friendly team is always here to chat.</p>
					</div>

					<div className="grid grid-cols-1 gap-12 mt-12 md:grid-cols-2 lg:grid-cols-3">
						<div className="flex flex-col items-center justify-center text-center">
							<span className="p-3 text-blue-700 rounded-full bg-blue-100/80 ">
								<Mail size={24} />
							</span>

							<h2 className="mt-4 text-lg font-medium text-gray-800 dark:text-white">Email</h2>
							<p className="mt-2 text-gray-500">Our friendly team is here to help.</p>
							<p className="mt-2 text-blue-950 font-semibold">icpfnet_engineering@yahoo.com </p>
						</div>

						<div className="flex flex-col items-center justify-center text-center">
							<span className="p-3 text-blue-700 rounded-full bg-blue-100/80">
								<MapPin size={24} />
							</span>

							<h2 className="mt-4 text-lg font-medium text-gray-800 dark:text-white">Office</h2>
							<p className="mt-2 text-gray-500">Come say hello at our office HQ.</p>
							<p className="mt-2 text-blue-950 font-semibold">Building A Andres Bijasa Road, Brgy. Gaya-gaya, CSJDM, Bulacan</p>
						</div>

						<div className="flex flex-col items-center justify-center text-center">
							<span className="p-3 text-blue-700 rounded-full bg-blue-100/80">
								<Phone size={24} />
							</span>

							<h2 className="mt-4 text-lg font-medium text-gray-800 dark:text-white">Phone</h2>
							<p className="mt-2 text-gray-500">Mon-Fri from 7 AM to 5 PM.</p>
							<p className="mt-2 text-blue-950 font-semibold">(044)-797-7554 </p>
						</div>
					</div>
				</div>

				<Footer />
			</section>
		</>
	);
};

export default Home;
