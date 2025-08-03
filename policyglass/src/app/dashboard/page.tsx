import { verifySession, isAdmin } from '../lib/session'
import Header from '../components/Header'
import Link from 'next/link'
import PolicyListView from '../components/PolicyListView'

export default async function DashboardPage() {
  const session = await verifySession()
  
  const userIsAdmin = await isAdmin()

  return (
    <div className="font-sans min-h-screen py-4 pb-20">
      <Header />
      <main className="flex flex-col gap-8">
        
        <div className="flex w-full max-w-6xl gap-8">
          {/* Welcome Section */}
          <div className="w-full bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Welcome, {session.username}!
            </h2>
            <p className="text-foreground mb-4">
              You are logged in as a {session.role}.
            </p>
            
            {/* Policy List View */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-foreground mb-3">All Policy Documents</h3>
              <PolicyListView userId={session.userId} />
            </div>
            
            {/* Admin Section (only visible to admins) */}
            {userIsAdmin && (
              <div className="border-t border-gray-300 pt-6">
                <h3 className="text-lg font-medium text-foreground mb-3">Admin Panel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-300 rounded-lg bg-blue-50">
                    <h4 className="font-medium text-foreground">User Management</h4>
                    <p className="text-foreground text-sm">Manage user accounts and roles</p>
                  </div>
                  <div className="p-4 border border-gray-300 rounded-lg bg-blue-50">
                    <h4 className="font-medium text-foreground">System Settings</h4>
                    <p className="text-foreground text-sm">Configure application settings</p>
                  </div>
                  <div className="p-4 border border-gray-300 rounded-lg bg-blue-50">
                    <h4 className="font-medium text-foreground">Audit Logs</h4>
                    <p className="text-foreground text-sm">View system activity and security logs</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
            {/* Navigation */}
            <div className="flex gap-4 justify-center">
              <Link 
                className="rounded-full border border-solid border-transparent transition-all duration-300 flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] hover:scale-105 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                href="/home"
              >
                Back to Home
              </Link>
              {userIsAdmin && (
                <Link 
                  className="rounded-full border border-solid border-transparent transition-all duration-300 flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] hover:scale-105 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                  href="/admin"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link 
                className="rounded-full border border-solid border-transparent transition-all duration-300 flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] hover:scale-105 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                href="/api/auth/logout"
              >
                Logout
              </Link>
            </div>
      </main>
    </div>
  )
}
