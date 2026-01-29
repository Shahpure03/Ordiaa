import { useState } from "react";
import { LogIn, UserPlus, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

interface AuthProps {
    onLogin: (token: string) => void;
}

export const AuthPages = ({ onLogin }: AuthProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const endpoint = isLogin ? "/auth/login" : "/auth/signup";
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

        try {
            if (isLogin) {
                // OAuth2 flow expects form-data for login
                const formData = new FormData();
                formData.append("username", email);
                formData.append("password", password);

                const response = await fetch(`${apiUrl}${endpoint}`, {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();

                if (response.ok) {
                    onLogin(data.access_token);
                } else {
                    setError(data.detail || "Login failed");
                }
            } else {
                // Signup expects JSON
                const response = await fetch(`${apiUrl}${endpoint}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    setIsLogin(true);
                    setError("Account created! Please log in.");
                } else {
                    setError(data.detail || "Signup failed");
                }
            }
        } catch (err) {
            console.error("Auth error:", err);
            setError(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}. Check if the backend is live at ${apiUrl}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-purple-50 to-teal-50 p-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-200/50 p-8 border border-white/20">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-rose-400 text-white mb-4 shadow-lg">
                        {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">
                        {isLogin ? "Welcome Back" : "Start your journey"}
                    </h2>
                    <p className="text-gray-500 mt-2">
                        {isLogin ? "Log in to continue to Ordiaa" : "Create an account to track your progress"}
                    </p>
                </div>

                {error && (
                    <div className={`p-4 rounded-xl mb-6 text-sm ${error.includes('created') ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all outline-none"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-200 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                {isLogin ? "Sign In" : "Create Account"}
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    {isLogin ? (
                        <p>
                            Don't have an account?{" "}
                            <button
                                onClick={() => setIsLogin(false)}
                                className="text-purple-600 font-semibold hover:underline cursor-pointer"
                            >
                                Sign up
                            </button>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{" "}
                            <button
                                onClick={() => setIsLogin(true)}
                                className="text-purple-600 font-semibold hover:underline cursor-pointer"
                            >
                                Log in
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
