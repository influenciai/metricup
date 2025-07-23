import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import LandingPage from "@/components/LandingPage";

type AuthView = "landing" | "login" | "signup";

export default function Auth() {
  const [view, setView] = useState<AuthView>("landing");

  const handleShowLogin = () => setView("login");
  const handleShowSignup = () => setView("signup");
  const handleBackToLanding = () => setView("landing");

  if (view === "login") {
    return <LoginForm onBack={handleBackToLanding} onSignup={handleShowSignup} />;
  }

  if (view === "signup") {
    return <SignupForm onBack={handleBackToLanding} onLogin={handleShowLogin} />;
  }

  return <LandingPage onLogin={handleShowLogin} onSignup={handleShowSignup} />;
}