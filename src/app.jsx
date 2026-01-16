import React, { useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from './pages/auth/LoginPage';
//import Dashboard from './pages/dashboard/Dashboard'; 

function Home() {
  return <h1>Welcome to the Bakery ERP</h1>;
}

function App() {
  // Changed from boolean to object to store mock user data (name, role, etc.)
  const [currentUser, setCurrentUser] = useState(null);

  // If no user is logged in, show the Login Page
  if (!currentUser) {
    return (
      <LoginPage 
        onLogin={(userData) => setCurrentUser(userData)} 
      />
    );
  }

  return (
    <div className="App">
      {/* Once logged in, show the Dashboard and pass user data + logout function */}
      <Dashboard 
        user={currentUser} 
        onLogout={() => setCurrentUser(null)} 
      />
    </div>
  );
}


const Dashboard = ({ user, onLogout }) => (
  <div style={{padding: '50px', background: '#566d7e', color: 'white'}}>
    <h1>TEST DASHBOARD</h1>
    <p>User: {user?.name}</p>
    <button onClick={onLogout}>Logout</button>
  </div>
);
export default App;

// Note: If you are using React 18, you might eventually move to createRoot, 
// but keeping this as per your requirement:
ReactDOM.render(<App />, document.getElementById("root"));