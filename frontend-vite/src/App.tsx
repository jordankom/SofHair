import { Routes, Route } from "react-router-dom";

// Pages
import LandingPage from "./pages/Auth/LandingPage";
import ClientDashboardPage from "./pages/Client/ClientDashboardPage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/client" element={<ClientDashboardPage />} />
        </Routes>
    );
}

export default App;
