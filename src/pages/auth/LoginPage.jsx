import React, { useState } from 'react';
import { Lock, User, Factory } from 'lucide-react';
import '../../assets/css/LoginPage.css'; // Importing the separate CSS

const LoginPage = ({ onLogin }) => {
    const [empCode, setEmpCode] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        
        // Regex for xxx-xxx format (exactly 7 chars including the dash)
        const codeRegex = /^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/;
        
        if (!codeRegex.test(empCode)) {
            setError("Format error: Employee Code must be 'xxx-xxx'.");
            return;
        }

        if (password.length < 4) {
            setError("Invalid Password: Too short.");
            return;
        }

        setError("");
        console.log("Authenticated:", empCode);
        
        // This function will be passed from App.js to handle navigation
        onLogin(); 
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
                                placeholder="e.g., adm-101"
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
                </form>
            </div>
        </div>
    );
};

export default LoginPage;