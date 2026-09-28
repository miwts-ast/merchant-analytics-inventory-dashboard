import { useState } from 'react';
import { FaHome, FaChevronCircleLeft, FaChartBar, FaCubes, FaCrown, FaChevronDown } from 'react-icons/fa'
import { AiOutlineMenu, AiOutlineClose, AiOutlineBell } from 'react-icons/ai'
import { Link } from 'react-router-dom'

const navItems = [
    { icon: FaHome, label: 'Dashboard', path: '/home' },
    { icon: FaChartBar, label: 'Sales Performance Hub', path: '/sales', badge: 1 },
    { icon: FaCubes, label: 'Inventory Control Center', path: '/inventory', badge: 2 },
];

function SidebarContent({ collapsed, onNavClick }) {
    return (
        <nav className="flex flex-col gap-1 p-2">
            {navItems.map(({ icon: Icon, label, path, badge }) => (
                <Link key={label} to={path} className='hover:bg-gray-700/50 rounded-md'>
                    <button
                        key={label}
                        onClick={onNavClick}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-200 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                        <Icon size={20} className="shrink-0" />
                        {!collapsed && <span>{label}</span>}
                        {badge ? <span className=' bg-red-500 font-bold rounded-full absolute right-0.5 mb-4 w-4 h-4 text-sm flex justify-center items-center'>{badge}</span> : null}
                    </button>
                </Link>
            ))}
        </nav>
    );
}

function StickyHeader({ onMenuClick, onIconClick }) {
    return (
        <header
            className="sticky top-0 z-20 h-14 flex items-center gap-3 px-4 border-b border-white/20
                 bg-white/60 backdrop-blur-md backdrop-saturate-150 shrink-0"
        >
            <button onClick={onMenuClick} className="cursor-pointer lg:hidden text-gray-600 hover:text-gray-900">
                <AiOutlineMenu size={22} />
            </button>
            <h1 className="font-semibold text-gray-800 lg:hidden">Dashboard</h1>
            <div className="absolute right-0 flex gap-2.5 justify-between p-2">
                <div className='relative h-14 flex items-center justify-center max-[400px]:hidden'>
                    <AiOutlineBell size={20} onClick={onIconClick} />
                    <span className="absolute top-3 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ">
                        3
                    </span>
                </div>
                <div className="flex items-center gap-2.5 justify-between  px-2">
                    <img src="/Merchant.jpg" alt="Profile" className="rounded-full w-8 h-8 object-cover" />
                    <span className='leading-3 max-[400px]:hidden'>
                        <h2 className="font-medium">Merchant A</h2>
                        <p className="font-extralight text-gray-500 text-sm">Business Owner</p>
                    </span>
                    <span>
                        <FaChevronDown size={10} className='text-gray-500' />
                    </span>
                </div>
            </div>
        </header>
    );
}

export default function AppLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const sideBarWidth = collapsed ? 64 : 240
    return (
        <div className="min-h-screen bg-gray-100">
            <aside
                className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-gray-900 transition-all duration-200"
                style={{ width: sideBarWidth }}
            >
                <div className={`flex items-center h-14 px-3 shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                    {!collapsed && <span className="text-white font-semibold">TradeFlow</span>}
                    <button
                        onClick={() => setCollapsed((c) => !c)}
                        className="cursor-pointer text-gray-300 hover:text-white p-1"
                    >
                        <FaChevronCircleLeft size={18} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                <SidebarContent collapsed={collapsed} className='fixed' />
                {collapsed ? null : <div className='bg-blue-950 my-2 mx-3 fixed bottom-0 w-55 rounded-2xl py-1 px-2 flex flex-col justify-center items-start max-[400px]:hidden'>
                    <h2 className='text-white font-semibold my-1 flex items-center justify-center'><FaCrown className='text-amber-400 inline mr-2.5 text-xl' />Upgrade to Pro</h2>
                    <p className='text-gray-500 leading-4'>Get advanced insights, custom reports, AI insights and more.</p>
                    <button className='bg-blue-600 rounded-md py-1 px-12 my-3 font-semibold flex items-center cursor-pointer hover:bg-blue-500 text-white'>Upgrade Now</button>
                </div>}
            </aside>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40 flex">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
                    <aside className="relative w-60 bg-gray-900 flex flex-col z-50 transition-all duration-200">
                        <div className="flex items-center justify-between h-14 px-3">
                            <span className="text-white font-semibold">TradeFlow</span>
                            <button onClick={() => setMobileOpen(false)} className="text-gray-300 hover:text-white p-1 cursor-pointer">
                                <AiOutlineClose size={20} />
                            </button>
                        </div>
                        <SidebarContent collapsed={false} onNavClick={() => setMobileOpen(false)} className='fixed' />
                        {collapsed ? null : <div className='bg-blue-950 my-2 mx-3 fixed bottom-0 w-55 rounded-2xl py-1 px-2 flex flex-col justify-center items-start max-[400px]:hidden'>
                            <h2 className='text-white font-semibold my-1 flex items-center justify-center'><FaCrown className='text-amber-400 inline mr-2.5 text-xl' />Upgrade to Pro</h2>
                            <p className='text-gray-500 leading-4'>Get advanced insights, custom reports, AI insights and more.</p>
                            <button className='bg-blue-600 rounded-md py-1 px-12 my-3 font-semibold flex items-center cursor-pointer hover:bg-blue-500 text-white'>Upgrade Now</button>
                        </div>}
                    </aside>
                </div>
            )}

            {/* Main content */}
            <div className="flex flex-col flex-1 min-w-0 h-full">
                <StickyHeader onMenuClick={() => setMobileOpen(true)} onIconClick={() => setMobileOpen(true)} />
                <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-6 lg:ml-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
