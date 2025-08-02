import { redirect } from 'next/navigation'
import { getSession } from '../lib/session'
import RegisterForm from '../components/RegisterForm'

export default async function RegisterPage() {
  const session = await getSession()
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Register for PolicyGlass
        </h1>
        
        <div className="w-full max-w-md">
          <RegisterForm />
          
          <div className="mt-4 text-center">
            <p className="text-foreground">
              Already have an account?{' '}
              <a href="/login" className="text-blue-500 hover:underline">
                Login here
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
