import React, { useState, useEffect } from 'react';
import { Lock, User } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import '../styles/LoginPage.css';
import type { User as UserModel } from '../types/models';

/**
 * LOGIN PAGE
 * 
 * Clean component that only handles UI and delegates
 * all business logic to the userStore (Zustand).
 * 
 * Similar to Flutter's StatefulWidget that uses Provider.
 */
interface LoginPageProps {
    onLogin: (user: UserModel) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    // Local UI state
    const [empCode, setEmpCode] = useState('');
    const [password, setPassword] = useState('');

    // Get auth state and actions from store
    const { login, loading, error, clearError, user, isAuthenticated } = useUserStore();

    const formatEmpCode = (value: string) => {
        const rawCode = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);

        if (rawCode.length <= 3) {
            return rawCode;
        }

        return `${rawCode.slice(0, 3)}-${rawCode.slice(3)}`;
    };

    const handleEmpCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmpCode(formatEmpCode(e.target.value));
    };

    /**
     * Effect: Redirect if already authenticated
     */
    useEffect(() => {
        if (isAuthenticated && user) {
            onLogin(user);
        }
    }, [isAuthenticated, user, onLogin]);

    /**
     * Effect: Clear errors when user types
     */
    useEffect(() => {
        if (error) {
            clearError();
        }
    }, [empCode, password]);

    /**
     * Handle form submission
     */
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await login(formatEmpCode(empCode), password);
            
            // Success - useEffect will handle redirect
            console.log('Login successful');
        } catch (err) {
            // Error is already set in store
            console.error('Login failed:', err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <img
                        src="/favicon/android-chrome-192x192.png"
                        alt="Bakery ERP logo"
                        className="login-logo"
                    />
                    <h2>Bakery ERP</h2>
                    <p>Bakery Management System</p>
                </div>

                <form onSubmit={handleLogin}>
                    {/* Employee Code Input */}
                    <div className="form-group">
                        <label>Employee Code</label>
                        <div className="input-wrapper">
                            <input 
                                type="text"
                                className="login-input emp-code-input"
                                placeholder="ABC-123"
                                value={empCode}
                                onChange={handleEmpCodeChange}
                                maxLength={7}
                                pattern="[A-Z0-9]{3}-[A-Z0-9]{3}"
                                autoCapitalize="characters"
                                autoComplete="username"
                                inputMode="text"
                                required
                                disabled={loading}
                            />
                            <User className="input-icon" size={20} aria-hidden="true" />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <input 
                                type="password"
                                className="login-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <Lock className="input-icon" size={20} aria-hidden="true" />
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="login-button" 
                        disabled={loading}
                    >
                        {loading ? "Verifying..." : "Secure Login"}
                    </button>
                    
                    <p style={{ 
                        fontSize: '11px', 
                        color: '#999', 
                        marginTop: '20px', 
                        textAlign: 'center' 
                    }}>
                        Authorized personnel only. Sessions are monitored.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
