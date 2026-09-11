import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Experience from "./pages/Experience";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import AdminIndex from "./pages/admin/AdminIndex";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />

        <Navbar />

        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/about" element={<About />} />

          <Route path="/projects" element={<Projects />} />

          <Route path="/projects/:slug" element={<Projects />} />

          <Route path="/experience" element={<Experience />} />

          <Route path="/gallery" element={<Gallery />} />

          <Route path="/contact" element={<Contact />} />

          <Route path="/admin" element={<AdminIndex />} />

        </Routes>

        <Footer />

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;