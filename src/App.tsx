import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { PageTransition } from "./components/layout/PageTransition";
import { Home } from "./pages/Home";
import { Marketplace } from "./pages/Marketplace";
import { TeamHub } from "./pages/TeamHub";
import { Dashboard } from "./pages/Dashboard";
import { Opportunity } from "./pages/Opportunity";
import { TalentDirectory } from "./pages/TalentDirectory";
import { UserProfile } from "./pages/UserProfile";
import { Messages } from "./pages/Messages";
import { Workspace } from "./pages/Workspace";
import { Admin } from "./pages/Admin";
import { Community } from "./pages/Community";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Blog } from "./pages/Blog";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { SavedItems } from "./pages/SavedItems";

function AppContent() {
  const location = useLocation();
  const isMessages = location.pathname === "/messages";
  const isWorkspace = location.pathname.startsWith("/workspace");
  const isAdmin = location.pathname === "/admin" || location.pathname.startsWith("/admin/");
  const isAuth = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/forgot-password";
  
  const hideNavFooter = isMessages || isWorkspace || isAdmin || isAuth;

  return (
    <div className="flex min-h-screen flex-col font-sans bg-[#07090E] selection:bg-purple-500/30">
      {!hideNavFooter && <Navbar />}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          {/* @ts-ignore */}
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/marketplace" element={<PageTransition><Marketplace /></PageTransition>} />
            <Route path="/opportunity/:id" element={<PageTransition><Opportunity /></PageTransition>} />
            <Route path="/talent" element={<PageTransition><TalentDirectory /></PageTransition>} />
            <Route path="/profile/:username" element={<PageTransition><UserProfile /></PageTransition>} />
            <Route path="/team-hub" element={<PageTransition><TeamHub /></PageTransition>} />
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/messages" element={<PageTransition><Messages /></PageTransition>} />
            <Route path="/workspace/:id" element={<PageTransition><Workspace /></PageTransition>} />
            <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
            <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
            <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
            <Route path="/saved" element={<PageTransition><SavedItems /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
      {!hideNavFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
