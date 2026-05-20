import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Dashboard from "./pages/Dashboard";
// import GuildSettings from "./pages/GuildSettings";
// import Login from "./pages/Login";
import Homepage from "./pages/Homepage";
import StyleTest from "./pages/Test";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/test" element={<StyleTest />} />
                {/* <Route path="/guild/:id/settings" element={<GuildSettings />} />
                <Route path="/login" element={<Login />} /> */}
                <Route path="*" element={<Navigate to="/" />} />{" "}
                {/* 404 fallback */}
            </Routes>
        </BrowserRouter>
    );
}
