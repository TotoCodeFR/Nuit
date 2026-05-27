import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import GuildSettings from "./pages/GuildSettings";
import Login from "./pages/Login";
import ModuleConfig from "./pages/ModuleConfig";
import Homepage from "./pages/Homepage";
import StyleTest from "./pages/Test";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                    path="/dashboard/:id/overview"
                    element={<GuildSettings />}
                />
                <Route
                    path="/dashboard/:guildId/:moduleId"
                    element={<ModuleConfig />}
                />
                <Route path="/test" element={<StyleTest />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}
