import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CupcakeIcon, EyeIcon, EyeOffIcon } from '../components/Icons';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithEmail } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await signInWithEmail(email, password);
    
    if (error) {
      setError('Credenciales inválidas. Por favor, intenta de nuevo.');
      console.error('Login error:', error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full max-w-md mx-auto flex flex-col justify-center items-center p-6 bg-background">
      <div className="w-full">
        <div className="text-center mb-8">
            <CupcakeIcon className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h1 className="font-heading text-3xl font-medium">Pastelería Cuaderno Digital</h1>
            <p className="text-text-main/70 mt-1">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-main/80 mb-1">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-secondary/30 focus:ring-secondary focus:border-secondary bg-white/80 text-text-main placeholder:text-text-main/50"
              placeholder="tu@correo.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-main/80 mb-1">Contraseña</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-secondary/30 focus:ring-secondary focus:border-secondary bg-white/80 text-text-main placeholder:text-text-main/50"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-text-main/50"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {error && (
            <p className="text-red-600 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-accent text-white font-bold py-4 rounded-lg shadow-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/50 disabled:bg-accent/50 disabled:cursor-wait transition-colors flex justify-center items-center"
              style={{ minHeight: '48px' }}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
