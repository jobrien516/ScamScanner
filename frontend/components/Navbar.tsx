import React from 'react';
import { NavLink } from 'react-router-dom';

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

const Navbar: React.FC = () => {
    const activeLinkStyle = {
        color: '#ffffff',
        backgroundColor: '#1e293b' // slate-800
    };

    return (
        <nav className="bg-slate-800/50 rounded-lg p-2 flex justify-between items-center border border-slate-700">
            <NavLink to="/" className="flex items-center gap-3">
                <ShieldIcon />
                <span className="text-xl font-bold text-slate-100 tracking-tight">ScamScanner</span>
            </NavLink>
            <div className="flex items-center gap-2">
                <NavLink 
                    to="/" 
                    className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                    style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                >
                    Home
                </NavLink>
                <NavLink 
                    to="/scanner" 
                    className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                    style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                >
                    Scanner
                </NavLink>
                <NavLink 
                    to="/mission" 
                    className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                    style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                >
                    Our Mission
                </NavLink>
            </div>
        </nav>
    );
};

export default Navbar;