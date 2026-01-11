import React, { useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from './pages/auth/LoginPage';
/*import Dashboard from './pages/dashboard/Dashboard'; */

function Home() {
  return <h1>Welcome to the Bakery ERP</h1>;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="App">
      {/* Once logged in, show the Dashboard */}
      <Dashboard />
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.getElementById("root"));