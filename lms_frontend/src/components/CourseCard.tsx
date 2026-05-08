"use client";

import { motion } from "framer-motion";
import { Users, Clock, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CourseCardProps {
  id: string | number;
  title: string;
  instructor: string;
  studentsCount: number;
  lessonsCount: number;
  duration: string;
  imageUrl: string;
}

export default function CourseCard({
  id,
  title,
  instructor,
  studentsCount,
  lessonsCount,
  duration,
  imageUrl,
}: CourseCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Course Image */}
      <div className="relative w-full h-48 overflow-hidden bg-secondary/30">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        
        {/* Placeholder for Next.js Image or standard img */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        
        {/* Category Badge overlay */}
        <div className="absolute top-4 left-4 z-20">
          <span className="px-3 py-1 text-xs font-semibold text-white bg-primary/80 backdrop-blur-md rounded-full shadow-sm">
            Top Rated
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-grow p-5">
        <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-foreground/60 mb-4">by {instructor}</p>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-foreground/70 mb-5">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-accent" />
            <span>{studentsCount} Students</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-accent" />
            <span>{lessonsCount} Lessons</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-accent" />
            <span>{duration}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-4 border-t border-border">
          <Link
            href={`/courses/${id}`}
            className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-white transition-colors"
          >
            View Course
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
