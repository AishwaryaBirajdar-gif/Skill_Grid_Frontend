import React, { useState } from 'react';
import { Briefcase, Users, Zap, Menu, X, ArrowRight, TrendingUp, Lightbulb, Grid, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Global Component: Button ---
const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button' }) => {
    let baseStyles = 'px-7 py-3 font-semibold rounded-full transition duration-300 shadow-xl flex items-center justify-center whitespace-nowrap text-lg';
    
    if (variant === 'primary') {
        baseStyles += ' bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-600 hover:to-indigo-700 focus:ring-4 focus:ring-teal-300/60 transform hover:scale-[1.05] active:scale-[1.02] shadow-teal-500/40';
    } else if (variant === 'secondary') {
        baseStyles += ' bg-transparent text-white border border-indigo-400 hover:border-teal-400 hover:bg-white/10 focus:ring-4 focus:ring-indigo-300/50 transform hover:scale-[1.02]';
    } else if (variant === 'ghost') {
        baseStyles += ' text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 shadow-none';
    }

    return (
        <button type={type} className={`${baseStyles} ${className}`} onClick={onClick}>
            {children}
        </button>
    );
};

// --- Layout Component: Header (Now uses useNavigate internally) ---
const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const navItems = [
        { name: 'Features', href: '#features' },
        { name: 'Our Vision', href: '#vision' },
        { name: 'Pricing', href: '#pricing' },
    ];

    return (
        <header className="fixed w-full top-0 left-0 bg-white bg-opacity-95 backdrop-blur-md shadow-lg z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                
                {/* Logo/Brand Name (Vibrant) */}
                <a href="#" onClick={() => navigate('/')} className="flex items-center space-x-2 text-3xl font-extrabold text-indigo-700 tracking-tight transition duration-300 hover:text-teal-500">
                    <Grid className="w-8 h-8 text-teal-500" />
                    <span>SkillGrid</span>
                </a>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    {navItems.map((item) => (
                        <a key={item.name} href={item.href} className="text-gray-600 hover:text-teal-500 font-medium transition duration-150">
                            {item.name}
                        </a>
                    ))}
                    <Button variant="ghost" onClick={() => navigate('/login')} className="py-2 px-4 shadow-none text-base">
                        Login
                    </Button>
                    <Button variant="primary" onClick={() => navigate('/signup')} className="py-2 px-4 shadow-lg text-base shadow-indigo-500/30">
                        Join SkillGrid <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </nav>

                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden text-gray-600 hover:text-teal-500 p-2" 
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white shadow-xl border-t border-gray-100 absolute w-full">
                    <nav className="flex flex-col p-4 space-y-2">
                        {navItems.map((item) => (
                             <a key={item.name} href={item.href} className="text-gray-700 hover:text-teal-500 p-3 rounded-lg transition duration-150 font-medium" onClick={() => setIsOpen(false)}>
                                 {item.name}
                            </a>
                        ))}
                        <Button variant="secondary" onClick={() => { navigate('/login'); setIsOpen(false); }} className="w-full mt-4 shadow-none text-base border-gray-200 text-gray-700 hover:bg-indigo-50">
                            Login
                        </Button>
                        <Button variant="primary" onClick={() => { navigate('/signup'); setIsOpen(false); }} className="w-full shadow-lg text-base shadow-indigo-500/30">
                            Join SkillGrid
                        </Button>
                    </nav>
                </div>
            )}
        </header>
    );
};

// --- Main HomePage Component ---
const HomePage = ({ isLoggedIn }) => { 
    const navigate = useNavigate();

    const features = [
        {
            icon: Share2,
            title: "Zero-Cost Exchange",
            description: "Forget cash. Barter your expertise directly for the skills you need, making learning equitable and accessible.",
            color: "teal",
        },
        {
            icon: Users,
            title: "Verified Global Network",
            description: "Connect with authenticated peers and mentors worldwide, ensuring quality and reliable skill trading.",
            color: "indigo",
        },
        {
            icon: Lightbulb,
            title: "Personal Growth Tracker",
            description: "Visualize your skill portfolio, track exchange hours, and watch your expertise graph trend upwards.",
            color: "purple",
        },
    ];

    const handleLoginClick = () => navigate('/login'); 
    const handleSignupClick = () => navigate('/signup'); 

    return (
        <div className="min-h-screen bg-gray-50 font-sans pt-[80px]"> 
            {/* Header now handles its own navigation internally */}
            <Header /> 

            {/* 1. Hero Section (Deep, Cinematic Gradient Background with CSS Visual) */}
            <section className="relative overflow-hidden py-24 md:py-32 lg:py-40 bg-gray-900">
                
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] z-0"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center lg:text-left text-center relative z-10">
                    
                    {/* Text Content Area (Left side on desktop) */}
                    <div className="lg:w-1/2 lg:pr-16 text-white">
                        <p className="text-teal-400 font-bold uppercase tracking-widest text-sm mb-4">
                            The Decentralized Skill Economy
                        </p>
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6">
                            Master New Skills, <br className="hidden sm:inline" />
                            <span className='text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-300'>Trade Your Talent.</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-xl mx-auto lg:mx-0 mb-10">
                            The future of learning is equitable and exchange-based. Offer what you know, gain what you need, and build your professional capital.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                            <Button onClick={handleSignupClick} variant="primary" className="text-lg shadow-2xl shadow-teal-500/30">
                                Start Your Journey Free
                            </Button>
                            {/* Changed to navigate to /login for consistency */}
                            <Button onClick={handleLoginClick} variant="secondary" className="text-lg">
                                How SkillGrid Works
                            </Button>
                        </div>
                    </div>

                    {/* CSS Visual: Skill Network Hub (Right side on desktop) */}
                    <div className="lg:w-1/2 mt-20 lg:mt-0 flex justify-center">
                        <div className="relative w-full max-w-lg h-96 flex items-center justify-center">
                            
                            {/* Central Hub (Glowing Core) */}
                            <div className="relative w-40 h-40 rounded-full bg-indigo-700 border border-indigo-500/50 shadow-2xl shadow-indigo-500/50 flex items-center justify-center animate-pulse-slow">
                                <TrendingUp className="w-12 h-12 text-teal-400" />
                                <div className="absolute inset-0 rounded-full border-4 border-teal-500/10 animate-ping-slow" />
                            </div>

                            {/* Connecting Nodes (Outer Orbit) */}
                            {/* Node 1: Design/Creativity */}
                            <div className="absolute w-12 h-12 rounded-full bg-teal-500 shadow-lg shadow-teal-500/50 -top-4 left-1/4 transform -translate-x-1/2 node-float"></div>
                            {/* Node 2: Development/Tech */}
                            <div className="absolute w-12 h-12 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50 top-1/2 -right-4 transform -translate-y-1/2 node-float" style={{ animationDelay: '1s' }}></div>
                            {/* Node 3: Business/Finance */}
                            <div className="absolute w-12 h-12 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50 bottom-0 left-1/3 transform -translate-x-1/2 node-float" style={{ animationDelay: '2s' }}></div>
                            {/* Node 4: Arts/Humanities */}
                            <div className="absolute w-12 h-12 rounded-full bg-pink-500 shadow-lg shadow-pink-500/50 bottom-1/4 -left-8 transform -translate-x-1/2 node-float" style={{ animationDelay: '3s' }}></div>
                        </div>
                    </div>
                </div>

                {/* Keyframe CSS for animation (must be inline in single React file) */}
                <style jsx="true">{`
                    @keyframes pulse-slow {
                        0%, 100% {
                            transform: scale(1);
                            opacity: 1;
                        }
                        50% {
                            transform: scale(1.05);
                            opacity: 0.9;
                        }
                    }
                    .animate-pulse-slow {
                        animation: pulse-slow 6s infinite ease-in-out;
                    }
                    
                    @keyframes ping-slow {
                        0% { transform: scale(1); opacity: 0.8; }
                        75%, 100% { transform: scale(1.5); opacity: 0; }
                    }
                    .animate-ping-slow {
                        animation: ping-slow 8s cubic-bezier(0, 0, 0.2, 1) infinite;
                    }
                    
                    @keyframes node-float {
                        0%, 100% {
                            transform: translateY(0) scale(1);
                        }
                        50% {
                            transform: translateY(-10px) scale(1.05);
                        }
                    }
                    .node-float {
                        animation: node-float 5s infinite ease-in-out;
                    }
                `}</style>
            </section>

            {/* 2. Feature Grid Section (Clean and modern cards with lift effect) */}
            <section id="features" className="py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 mb-4">
                        Core Principles of the Exchange
                    </h2>
                    <p className="text-xl text-center text-gray-500 max-w-2xl mx-auto mb-16">
                        We are building a collaborative ecosystem where value is measured in knowledge, not currency.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {features.map((feature, index) => (
                            <div 
                                key={index} 
                                className="bg-white p-8 rounded-xl shadow-2xl hover:shadow-3xl transition duration-500 transform hover:-translate-y-2 border-t-4 border-transparent"
                                // Dynamic Border/Shadow based on feature color
                                style={{
                                    borderTopColor: `var(--color-${feature.color}-500, #4f46e5)`,
                                    boxShadow: `0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)`,
                                }}
                                onMouseEnter={e => {
                                    // Add a slight colored glow on hover
                                    const colorMap = {
                                        teal: '0 0 20px rgba(20, 184, 166, 0.4)', // teal-500
                                        indigo: '0 0 20px rgba(99, 102, 241, 0.4)', // indigo-500
                                        purple: '0 0 20px rgba(168, 85, 247, 0.4)', // purple-500
                                    };
                                    e.currentTarget.style.boxShadow = `${colorMap[feature.color]}`;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = `0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)`;
                                }}
                            >
                                {/* Dynamic Gradient Icon Background */}
                                <div className={`mb-6 w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-${feature.color}-400 to-${feature.color}-600 shadow-xl shadow-${feature.color}-500/30`}>
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* 3. Call to Action Footer (Strong contrast and focus) */}
            <footer className="bg-gray-800 text-white py-16 border-t-4 border-teal-500">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
                        <span className='text-teal-400'>Stop paying.</span> Start trading.
                    </h3>
                    <p className="text-gray-400 mb-10 max-w-3xl mx-auto text-xl">
                        Unlock your potential today. It only takes 60 seconds to create your profile and list your first skill exchange.
                    </p>
                    <Button onClick={handleSignupClick} variant="primary" className="text-xl px-10 py-4 shadow-xl shadow-teal-500/40">
                        Join the Revolution Now
                    </Button>
                    <div className="mt-16 border-t border-gray-700 pt-8">
                        <p className="text-gray-500 text-sm">
                            &copy; {new Date().getFullYear()} SkillGrid. All rights reserved. | <a href="#" className='hover:text-teal-400 transition'>Terms & Conditions</a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;