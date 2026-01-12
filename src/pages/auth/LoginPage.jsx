import React, { useState } from 'react';
import { Lock, User, Factory } from 'lucide-react';
import '../../assets/css/LoginPage.css';

// Mock Data for Simulation
const MOCK_USERS = [
    { code: 'adm-001', password: 'password123', name: 'Manager', role: 'Admin' },
    { code: 'bak-001', password: 'pass123', name: 'Baker', role: 'Production' },
    { code: 'whs-001', password: 'word123', name: 'Storeman', role: 'Warehouse' }
];

const LoginPage = ({ onLogin }) => {
    const [empCode, setEmpCode] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        
        // 1. Format Validation (xxx-xxx)
        const codeRegex = /^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/;
        if (!codeRegex.test(empCode)) {
            setError("Format error: Employee Code must be 'xxx-xxx'.");
            return;
        }

        // 2. Credential Verification against Mock Data
        const user = MOCK_USERS.find(u => u.code === empCode && u.password === password);

        if (user) {
            setError("");
            console.log("Login Successful:", user.name);
            // Pass the user object back to App.js
            onLogin(user); 
        } else {
            setError("Invalid Employee Code or Password.");
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
                    <div className="form-group">
                        <label>Employee Code</label>
                        <div className="input-wrapper">
                            <User className="input-icon" size={18} />
                            <input 
                                type="text"
                                className="login-input"
                                placeholder="e.g., adm-001"
                                value={empCode}
                                onChange={(e) => setEmpCode(e.target.value.toLowerCase())}
                                maxLength={7}
                            />
                        </div>
                    </div>

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
                            />
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="login-button">
                        Secure Login
                    </button>
                    
                    {/* Helper text for your testing convenience */}
                    <p style={{ fontSize: '10px', color: '#999', marginTop: '15px', textAlign: 'center' }}>
                        Test Code: adm-001 | Pass: password123
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;