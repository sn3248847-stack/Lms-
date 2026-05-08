import Link from "next/link";
import { BookOpen, LogIn, Menu } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <div className="bg-primary/20 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Nexus
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-foreground/80">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/courses" className="hover:text-primary transition-colors">Courses</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <DarkModeToggle />
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/20">
            <LogIn className="w-4 h-4" />
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-foreground/70 hover:text-foreground">
          <Menu className="w-6 h-6" />
        </button>

      </div>
    </header>
  );
}
