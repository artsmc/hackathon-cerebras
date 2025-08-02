import { verifySession, isAdmin } from '../../lib/session'

export default async function AdminUsersPage() {
  const session = await verifySession()
  const userIsAdmin = await isAdmin()
  
  if (!userIsAdmin) {
    return (
      <div className="font-sans min-h-screen p-8 pb-20">
        <main className="flex flex-col gap-8 items-center justify-center min-h-screen">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Access Denied
          </h1>
          <p className="text-foreground">
            You must be an administrator to access this page.
          </p>
          <div className="flex gap-4">
            <a 
              className="rounded-full border border-solid border-transparent transition-all duration-300 flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] hover:scale-105 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              href="/dashboard"
            >
              Back to Dashboard
            </a>
          </div>
        </main>
      </div>
    )
  }

  // In a real application, this would fetch users from the API
  const users = [
    { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', created_at: '2025-08-02', last_login: '2025-08-02 15:30:00' },
    { id: 2, username: 'user1', email: 'user1@example.com', role: 'user', created_at: '2025-08-01', last_login: '2025-08-02 14:20:00' },
    { id: 3, username: 'user2', email: 'user2@example.com', role: 'user', created_at: '2025-07-28', last_login: '2025-08-01 10:15:00' },
  ]

  return (
    <div className="font-sans min-h-screen p-8 pb-20">
      <main className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          User Management
        </h1>
        
        <div className="flex w-full max-w-6xl gap-8">
          <div className="w-full bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              All Users
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.created_at}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.last_login}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <a 
            className="rounded-full border border-solid border-transparent transition-all duration-300 flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] hover:scale-105 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/admin"
          >
            Back to Admin Dashboard
          </a>
          <a 
            className="rounded-full border border-solid border-transparent transition-all duration-300 flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] hover:scale-105 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/dashboard"
          >
            Back to Dashboard
          </a>
          <a 
            className="rounded-full border border-solid border-transparent transition-all duration-300 flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] hover:scale-105 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/api/auth/logout"
          >
            Logout
          </a>
        </div>
      </main>
    </div>
  )
}
