import React, { useState, useEffect } from 'react';
import { Lock, User, Factory } from 'lucide-react';
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
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            await login(empCode, password);
            
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
                    <Factory size={50} color="#566d7e" strokeWidth={1.5} />
                    <h2>Bakery ERP</h2>
                    <p>Bakery Management System</p>
                </div>

                <form onSubmit={handleLogin}>
                    {/* Employee Code Input */}
                    <div className="form-group">
                        <label>Employee Code</label>
                        <div className="input-wrapper">
                            <User className="input-icon" size={18} />
                            <input 
                                type="text"
                                className="login-input"
                                placeholder="e.g., abc-123"
                                value={empCode}
                                onChange={(e) => setEmpCode(e.target.value)}
                                maxLength={7}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input 
                                type="password"
                                className="login-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
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