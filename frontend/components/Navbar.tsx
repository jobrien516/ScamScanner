import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldIcon } from './Icons';

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
                    to="/history" 
                    className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                    style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                >
                    History
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