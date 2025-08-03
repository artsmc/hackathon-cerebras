import { verifySession, isAdmin } from '../lib/session'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const session = await verifySession()
  const userIsAdmin = await isAdmin()
  
  // Double check admin role (middleware should have caught this, but extra safety)
  if (!userIsAdmin) {
    return (
      <div className="font-sans min-h-screen py-4 pb-20">
        <main className="flex flex-col gap-8 items-center justify-center min-h-screen">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Access Denied
          </h1>
          <p className="text-foreground">
            You must be an administrator to access this page.
          </p>
          <div className="flex gap-4">
            <Link 
              className="rounded-full border border-solid border-transparent transition-all duration-300 flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] hover:scale-105 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              href="/dashboard"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="font-sans min-h-screen py-4 pb-20">
      <main className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Admin Dashboard
        </h1>
        
        <div className="flex w-full max-w-6xl gap-8">
          <div className="w-full bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Welcome, Admin {session.username}!
            </h2>
            <p className="text-foreground mb-6">
              This is the administrative dashboard with enhanced privileges.
            </p>
            
            {/* Admin Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 border border-gray-300 rounded-lg bg-blue-50 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-medium text-foreground mb-2">User Management</h3>
                <p className="text-foreground text-sm mb-4">Manage user accounts, roles, and permissions</p>
                <Link 
                  className="text-blue-600 hover:underline text-sm font-medium"
                  href="/admin/users"
                >
                  View Users →
                </Link>
              </div>
              
              <div className="p-6 border border-gray-300 rounded-lg bg-blue-50 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-medium text-foreground mb-2">System Settings</h3>
                <p className="text-foreground text-sm mb-4">Configure application-wide settings</p>
                <Link 
                  className="text-blue-600 hover:underline text-sm font-medium"
                  href="/admin/settings"
                >
                  Configure →
                </Link>
              </div>
              
              <div className="p-6 border border-gray-300 rounded-lg bg-blue-50 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-medium text-foreground mb-2">Audit Logs</h3>
                <p className="text-foreground text-sm mb-4">View security events and user activity</p>
                <Link 
                  className="text-blue-600 hover:underline text-sm font-medium"
                  href="/admin/logs"
                >
                  View Logs →
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <Link 
            className="rounded-full border border-solid border-transparent transition-all duration-300 flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] hover:scale-105 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/dashboard"
          >
            Back to Dashboard
          </Link>
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
