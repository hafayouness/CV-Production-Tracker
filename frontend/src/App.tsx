import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import DeclarationPage from "./pages/DeclarationPage";

export default function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/declaration" element={<DeclarationPage />} />
        </Routes>
      </main>
    </div>
  );
}
