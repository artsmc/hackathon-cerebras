import { redirect } from 'next/navigation'
import { getSession } from '../lib/session'
import LoginForm from '../components/LoginForm'

export default async function LoginPage() {
  const session = await getSession()
  
  

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Login to PolicyGlass
        </h1>
        
        <div className="w-full max-w-md">
          <LoginForm />
          
          <div className="mt-4 text-center">
            <p className="text-foreground">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-500 hover:underline">
                Register here
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
