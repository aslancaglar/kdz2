import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight, UserPlus } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const HERO_VIDEO_ID = "kg218cqrg7hzg0ghqj531aqpy180haz8" as any;

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    const videoUrl = useQuery(api.files.getUrl, { storageId: HERO_VIDEO_ID });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const success = await login(email, password);
            if (success) {
                navigate(redirect);
            } else {
                setError('Email ou mot de passe incorrect');
            }
        } catch (err) {
            setError('Une erreur est survenue lors de la connexion');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative h-[30vh] min-h-[250px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    {videoUrl ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="hidden md:block w-full h-full object-cover"
                            key={videoUrl}
                        >
                            <source src={videoUrl} type="video/mp4" />
                        </video>
                    ) : (
                        <div className="absolute inset-0 bg-dark-950" />
                    )}
                    <img
                        src="https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=1920"
                        alt="Kebab background"
                        className="md:hidden w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-dark-950/65 via-dark-900/65 to-dark-900/65" />
                </div>

                <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pt-8">
                    <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white mb-3 tracking-wide uppercase">
                        Connexion
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 font-light">
                        Heureux de vous revoir !
                    </p>
                </div>
            </section>

            <div className="flex items-center justify-center p-4 py-12">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        <div className="p-8">
                            <div className="text-center mb-8 hidden">
                                <h1 className="text-3xl font-bold text-gray-900 font-display">Connexion</h1>
                                <p className="text-gray-500 mt-2">Heureux de vous revoir !</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-red-500 text-gray-900"
                                            placeholder="votre@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Mot de passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-red-500 text-gray-900"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {isLoading ? 'Connexion...' : 'Se connecter'}
                                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>

                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <div className="text-center space-y-4">
                                    <p className="text-sm text-gray-600">Pas encore de compte ?</p>
                                    <Link
                                        to={`/signup?redirect=${redirect}`}
                                        className="flex items-center justify-center gap-2 text-red-500 font-bold hover:text-red-600 transition-colors group"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        Créer un compte
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
