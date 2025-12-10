import React from 'react'
import Navbar from '../Componnents/Navbar'
import Footer from '../Componnents/Footer'
import AdminSidebar from './AdminSidebar'

interface DashboardLayoutProps {
    children: React.ReactNode
}

const AdminDashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navbar */}
            <Navbar />

            {/* Layout Container - Takes available space */}
            <div className="flex flex-1">
                {/* Sidebar - Hidden on mobile, visible on larger screens */}
                <div className="hidden lg:block">
                    <AdminSidebar />
                </div>

                {/* Main Content */}
                <main className="flex-1 w-full lg:ml-64 transition-all duration-300">
                    <div className="p-4 md:p-6 min-h-[calc(100vh-128px)]">
                        {children}
                    </div>
                </main>
            </div>

            {/* Footer at bottom */}
            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    )
}

export default AdminDashboardLayout