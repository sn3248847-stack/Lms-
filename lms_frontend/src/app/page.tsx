"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Video, Award, ChevronRight } from "lucide-react";
import Link from "next/link";
import CourseCard from "@/components/CourseCard";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const features = [
    {
      icon: <Video className="w-6 h-6 text-primary" />,
      title: "Interactive Video Lectures",
      desc: "High-quality video playback with built-in progress tracking.",
    },
    {
      icon: <Award className="w-6 h-6 text-accent" />,
      title: "Auto-Graded Quizzes",
      desc: "Instant feedback and scoring using our advanced grading engine.",
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Role-Based Access",
      desc: "Customized dashboards for Instructors, Students, and Admins.",
    },
    {
      icon: <BookOpen className="w-6 h-6 text-accent" />,
      title: "Smart Plagiarism Detection",
      desc: "Automated analysis to detect AI and web-copied content.",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 overflow-hidden">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-6xl mx-auto text-center"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-md">
            Welcome to the Future of Learning
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-6 leading-tight">
            Nexus LMS
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-foreground/70 mb-10">
            A premium, high-performance learning management system equipped with auto-grading, real-time notifications, and AI plagiarism detection.
          </p>
        </motion.div>

        {/* Call to Actions */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            href="/login?to=student"
            className="group relative flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto font-semibold text-white bg-primary rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            Student Dashboard
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/login?to=instructor"
            className="group flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto font-semibold text-foreground glass rounded-xl transition-all hover:bg-secondary/50 hover:scale-105 active:scale-95"
          >
            Instructor Portal
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="glass p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all hover:border-primary/30"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-background shadow-sm mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured Courses Section */}
        <motion.div variants={itemVariants} className="mt-32 mb-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Trending Courses</h2>
          <p className="text-foreground/60 max-w-xl mx-auto">
            Discover our most popular courses, taught by industry experts and designed to take your skills to the next level.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left mb-20"
        >
          {/* Sample Course 1 */}
          <CourseCard 
            id="1"
            title="Advanced Machine Learning Algorithms"
            instructor="Dr. Sarah Chen"
            studentsCount={1240}
            lessonsCount={24}
            duration="8h 30m"
            imageUrl="https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=600"
          />
          
          {/* Sample Course 2 */}
          <CourseCard 
            id="2"
            title="Full-Stack Next.js 14 Development"
            instructor="Alex Johnson"
            studentsCount={3890}
            lessonsCount={42}
            duration="14h 15m"
            imageUrl="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600"
          />

          {/* Sample Course 3 */}
          <CourseCard 
            id="3"
            title="UI/UX Masterclass: From Figma to Code"
            instructor="Emma Wright"
            studentsCount={850}
            lessonsCount={18}
            duration="6h 45m"
            imageUrl="https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600"
          />
        </motion.div>

      </motion.div>

      {/* Tailwind Custom Animation (inline fallback) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
