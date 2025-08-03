import LoginForm from '../components/LoginForm'

export default async function LoginPage() {

  return (
    <div 
      className="font-sans min-h-screen py-4 pb-20 relative"
      style={{ 
        backgroundImage: "url('/login.jpg')",
        backgroundSize: '112.5%',
        backgroundPosition: '35% center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <main className="absolute top-1/2 left-[10%] transform -translate-y-1/2 w-full max-w-md">
        
        <div className="w-full">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-8 text-shadow-lg/20">
          Login to PolicyGlass
        </h1>
        
          <LoginForm />
          
          <div className="mt-4 text-center">
            <p className="text-background">
              Don&apos;t have an account?{' '}
              <a href="/register" className="text-lime-300 hover:underline">
                Register here
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
