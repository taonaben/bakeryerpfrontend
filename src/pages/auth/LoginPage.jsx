import React, { useState } from 'react';
import axios from 'axios'; // Ensure you ran 'npm install axios'
import { Lock, User, Factory } from 'lucide-react';
import '../../assets/css/LoginPage.css';

const LoginPage = ({ onLogin }) => {
    // State hooks for form inputs and UI feedback
    const [empCode, setEmpCode] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Handles the form submission and API communication
     */
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        
        // 1. Frontend Validation (Format: xxx-xxx)
        // We check this locally first to save server resources
        const codeRegex = /^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/;
        if (!codeRegex.test(empCode)) {
            setError("Format error: Employee Code must be 'xxx-xxx'.");
            setIsLoading(false);
            return;
        }

        try {
            // 2. API Request to Django Backend
            // We send the emp_code and password as expected by your LoginSerializer
            const response = await axios.post('https://bakeryerpbackend.onrender.com/account/login/', {
                emp_code: empCode,
                password: password
            });

            // 3. Destructure JWT tokens and User data from response
            const { access, refresh, user } = response.data;

            // 4. Store JWT Tokens in LocalStorage
            // These will be needed later for authenticated requests to other modules
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);

          

            console.log("Login Successful for:", userData.name);
            
            // Pass user object to App.js to switch view to Dashboard
            onLogin(userData); 

        } catch (err) {
            // 6. Detailed Error Handling
            if (err.response) {
                // Server responded with an error (e.g., 400 or 401)
                setError(err.response.data.detail || "Invalid Credentials");
            } else if (err.request) {
                // Request was made but no response received (Server down)
                setError("No response from server. Please try again later.");
            } else {
                // Something else went wrong
                setError("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
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
                                disabled={isLoading}
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
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Feedback: Error Messages */}
                    {error && <div className="error-message">{error}</div>}

                    {/* Submit Button with Loading State */}
                    <button 
                        type="submit" 
                        className="login-button" 
                        disabled={isLoading}
                    >
                        {isLoading ? "Verifying..." : "Secure Login"}
                    </button>
                    
                    <p style={{ fontSize: '11px', color: '#999', marginTop: '20px', textAlign: 'center' }}>
                        Authorized personnel only. Sessions are monitored.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;