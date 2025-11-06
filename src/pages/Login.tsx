// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { Button } from '../components/ui/button';
// import { Input } from '../components/ui/input';
// import { Label } from '../components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
// import { toast } from 'sonner';
// import { GraduationCap, Loader2 } from 'lucide-react';
//
// export const Login: React.FC = () => {
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//
//     if (!username || !password) {
//       toast.error('Please fill in all fields');
//       return;
//     }
//
//     setLoading(true);
//     try {
//       await login({ username, password });
//       toast.success('Login successful!');
//       navigate('/dashboard');
//     } catch (error) {
//       toast.error('Login failed. Please check your credentials.');
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const handleGuestLogin = async () => {
//     setLoading(true);
//     try {
//       await login({ username: 'guest', password: 'guest' });
//       toast.success('Logged in as guest');
//       navigate('/dashboard');
//     } catch (error) {
//       toast.error('Failed to login as guest');
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-1 text-center">
//           <div className="flex justify-center mb-4">
//             <div className="bg-blue-600 p-3 rounded-full">
//               <GraduationCap className="w-8 h-8 text-white" />
//             </div>
//           </div>
//           <CardTitle className="text-2xl">Welcome Back</CardTitle>
//           <CardDescription>
//             Sign in to your account to continue learning
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="username">Username</Label>
//               <Input
//                 id="username"
//                 type="text"
//                 placeholder="Enter your username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 disabled={loading}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 disabled={loading}
//               />
//             </div>
//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? (
//                 <>
//                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                   Signing in...
//                 </>
//               ) : (
//                 'Sign In'
//               )}
//             </Button>
//           </form>
//
//           <div className="relative my-6">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-300"></div>
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-2 bg-white text-gray-500">Or</span>
//             </div>
//           </div>
//
//           <Button
//             type="button"
//             variant="outline"
//             className="w-full"
//             onClick={handleGuestLogin}
//             disabled={loading}
//           >
//             Continue as Guest
//           </Button>
//
//           <div className="mt-6 text-center text-sm">
//             <span className="text-gray-600">Don't have an account? </span>
//             <Link to="/register" className="text-blue-600 hover:underline">
//               Sign up
//             </Link>
//           </div>
//
//           <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
//             <p className="text-sm mb-2">Demo Accounts:</p>
//             <div className="text-xs space-y-1 text-gray-700">
//               <p><strong>Admin:</strong> username: admin, password: admin</p>
//               <p><strong>Moderator:</strong> username: moderator, password: moderator</p>
//               <p><strong>User:</strong> username: user, password: user</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { GraduationCap, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login({ username, password });
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (error: any) {
            // Handle specific error cases
            if (error.response) {
                // Server responded with error status
                const status = error.response.status;
                const message = error.response.data?.message || error.response.data?.error;

                if (status === 401) {
                    toast.error('Invalid username or password');
                } else if (status === 403) {
                    toast.error(message || 'Account is not active or verified');
                } else if (status === 429) {
                    toast.error('Too many login attempts. Please try again later');
                } else if (status >= 500) {
                    toast.error('Server error. Please try again later');
                } else {
                    toast.error(message || 'Login failed. Please try again');
                }
            } else if (error.request) {
                // Request made but no response
                toast.error('Unable to connect to server. Please check your connection');
            } else {
                // Other errors
                toast.error('An unexpected error occurred');
            }
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setLoading(true);
        try {
            await login({ username: 'guest', password: 'guest' });
            toast.success('Logged in as guest');
            navigate('/dashboard');
        } catch (error: any) {
            if (error.response?.status === 401) {
                toast.error('Guest account not available');
            } else {
                toast.error('Failed to login as guest');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-600 p-3 rounded-full">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <CardDescription>
                        Sign in to your account to continue learning
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                autoComplete="username"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                autoComplete="current-password"
                            />
                            <div className="flex justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleGuestLogin}
                        disabled={loading}
                    >
                        Continue as Guest
                    </Button>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-600">Don't have an account? </span>
                        <Link to="/register" className="text-blue-600 hover:underline">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};