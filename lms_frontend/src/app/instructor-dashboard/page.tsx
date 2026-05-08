"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import DarkModeToggle from "@/components/DarkModeToggle";
import ProgressBar from "@/components/ProgressBar";
import {
  BookOpen, Video, FileText, ClipboardList, Users, Megaphone,
  LogOut, Plus, Trash2, Check, ExternalLink, Send, Upload, BarChart2, X, File
} from "lucide-react";

const TABS = ["My Courses", "Lectures", "Assignments", "Quizzes", "Submissions", "Students", "Announce"];
const TAB_ICONS: any = {
  "My Courses": <BookOpen className="w-4 h-4" />,
  "Lectures": <Video className="w-4 h-4" />,
  "Assignments": <FileText className="w-4 h-4" />,
  "Quizzes": <ClipboardList className="w-4 h-4" />,
  "Submissions": <BarChart2 className="w-4 h-4" />,
  "Students": <Users className="w-4 h-4" />,
  "Announce": <Megaphone className="w-4 h-4" />,
};

export default function InstructorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("My Courses");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Forms
  const [newLecture, setNewLecture] = useState({ course: "", title: "", description: "", video_url: "" });
  const [newAssignment, setNewAssignment] = useState({ course: "", title: "", description: "", due_date: "" });
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [newQuiz, setNewQuiz] = useState({ course: "", title: "", description: "", time_limit_minutes: 30, due_date: "" });
  const [announcement, setAnnouncement] = useState({ course: "", title: "", content: "" });
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [gradeValue, setGradeValue] = useState("");
  const [feedbackValue, setFeedbackValue] = useState("");
  const [viewingStudent, setViewingStudent] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [liveCourseId, setLiveCourseId] = useState<number | null>(null);
  const [liveForm, setLiveForm] = useState({ title: "Live Interactive Session", meeting_link: "" });

  const fetchData = async () => {
    try {
      console.log("Fetching courses...");
      const cRes = await api.get("courses/");
      setCourses(cRes.data);
    } catch (err) { console.error("Error fetching courses:", err); }

    try {
      console.log("Fetching enrollments...");
      const eRes = await api.get("enrollments/");
      setEnrollments(eRes.data);
    } catch (err) { console.error("Error fetching enrollments:", err); }

    try {
      console.log("Fetching lectures...");
      const lRes = await api.get("lectures/");
      setLectures(lRes.data);
    } catch (err) { console.error("Error fetching lectures:", err); }

    try {
      console.log("Fetching assignments...");
      const aRes = await api.get("assignments/");
      setAssignments(aRes.data);
    } catch (err) { console.error("Error fetching assignments:", err); }

    try {
      console.log("Fetching quizzes...");
      const qRes = await api.get("quizzes/");
      setQuizzes(qRes.data);
    } catch (err) { console.error("Error fetching quizzes:", err); }

    try {
      console.log("Fetching submissions...");
      const sRes = await api.get("submissions/");
      setSubmissions(sRes.data);
    } catch (err) { console.error("Error fetching submissions:", err); }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get("users/me/");
        if (res.data.role !== "INSTRUCTOR") router.push("/login");
        else { setUser(res.data); fetchData(); }
      } catch { router.push("/login"); }
    };
    init();
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("access_token"); Cookies.remove("refresh_token"); Cookies.remove("user_role");
    router.push("/login");
  };

  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api.post("lectures/", newLecture);
      setNewLecture({ course: "", title: "", description: "", video_url: "" });
      fetchData(); alert("Lecture added!");
    } catch { alert("Error adding lecture."); }
    setSubmitting(false);
  };

  const handleStartLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveForm.meeting_link) return alert("Please provide a meeting link.");
    setSubmitting(true);
    try {
      await api.post("live-classes/", {
        course: liveCourseId,
        title: liveForm.title,
        meeting_link: liveForm.meeting_link,
        start_time: new Date().toISOString(),
        is_active: true
      });
      alert("Class is now LIVE! Students have been notified.");
      setLiveCourseId(null);
      setLiveForm({ title: "Live Interactive Session", meeting_link: "" });
      fetchData();
    } catch { alert("Error starting live class."); }
    setSubmitting(false);
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm("Delete this lecture?")) { await api.delete(`lectures/${id}/`); fetchData(); }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    const formData = new FormData();
    formData.append("course", newAssignment.course);
    formData.append("title", newAssignment.title);
    formData.append("description", newAssignment.description);
    formData.append("due_date", newAssignment.due_date);
    if (assignmentFile) formData.append("file_attachment", assignmentFile);

    try {
      await api.post("assignments/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setNewAssignment({ course: "", title: "", description: "", due_date: "" });
      setAssignmentFile(null);
      fetchData(); alert("Assignment created!");
    } catch { alert("Error adding assignment."); }
    setSubmitting(false);
  };

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api.post("quizzes/", newQuiz);
      setNewQuiz({ course: "", title: "", description: "", time_limit_minutes: 30, due_date: "" });
      fetchData(); alert("Quiz created! Add questions via Django Admin Panel.");
    } catch { alert("Error creating quiz."); }
    setSubmitting(false);
  };

  const handleGradeSubmission = async (id: number) => {
    try {
      await api.patch(`submissions/${id}/`, { grade: gradeValue, feedback: feedbackValue });
      setGradingId(null); setGradeValue(""); setFeedbackValue("");
      fetchData(); alert("Grade saved!");
    } catch { alert("Error saving grade."); }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api.post("announcements/", {
        ...announcement,
        course: announcement.course || null,
      });
      setAnnouncement({ course: "", title: "", content: "" });
      alert(announcement.course ? "Course announcement sent!" : "Global announcement sent to all students!");
    } catch { alert("Error sending announcement."); }
    setSubmitting(false);
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const fieldClass = "w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";
  const btnClass = "w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2";

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 p-4 glass rounded-2xl border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-xl"><BookOpen className="w-6 h-6 text-primary" /></div>
            <div>
              <h1 className="font-bold text-lg">Instructor Dashboard</h1>
              <p className="text-xs text-foreground/60">Welcome, <span className="text-primary font-semibold">{user.username}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-border hover:bg-secondary/60 transition-all">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </motion.header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "My Courses", value: courses.length, icon: <BookOpen className="w-5 h-5 text-primary" /> },
            { label: "Students", value: enrollments.length, icon: <Users className="w-5 h-5 text-accent" /> },
            { label: "Lectures", value: lectures.length, icon: <Video className="w-5 h-5 text-purple-500" /> },
            { label: "Submissions", value: submissions.length, icon: <FileText className="w-5 h-5 text-orange-500" /> },
          ].map((s, i) => (
            <motion.div key={i} whileHover={{ y: -3 }}
              className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-xs text-foreground/60">{s.label}</span></div>
              <div className="text-2xl font-black">{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-card border border-border hover:bg-secondary/50 text-foreground/70"
                }`}>
                {TAB_ICONS[tab]}{tab}
              </button>
            ))}
          </div>

          {activeTab !== "My Courses" && activeTab !== "Announce" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground/50 font-semibold uppercase tracking-wider">Filter by Course:</span>
              <select value={selectedCourseId || ""} onChange={e => setSelectedCourseId(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">All Courses</option>
                {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            {/* MY COURSES */}
            {activeTab === "My Courses" && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((c: any) => {
                  const enrolled = enrollments.filter((e: any) => e.course === c.id);
                  return (
                    <motion.div key={c.id} whileHover={{ y: -4 }}
                      className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold">{c.title}</h3>
                      <p className="text-sm text-foreground/60 line-clamp-2">{c.description}</p>
                      <div className="flex items-center justify-between gap-2 text-xs text-foreground/50 pt-2 border-t border-border">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{enrolled.length} students</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setLiveCourseId(c.id)}
                            className="text-red-500 font-bold hover:bg-red-500/10 px-2 py-1 rounded-lg flex items-center gap-1 transition-all">
                            <Video className="w-3 h-3" /> Go Live
                          </button>
                          <button onClick={() => { setSelectedCourseId(c.id); setActiveTab("Submissions"); }}
                            className="text-primary font-bold hover:underline flex items-center gap-1">
                            View Details <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* LECTURES */}
            {activeTab === "Lectures" && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" />Upload Lecture</h3>
                  <form onSubmit={handleAddLecture} className="space-y-3">
                    <select value={newLecture.course} onChange={e => setNewLecture(p => ({ ...p, course: e.target.value }))} className={fieldClass} required>
                      <option value="">Select Course</option>
                      {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <input className={fieldClass} placeholder="Lecture Title" value={newLecture.title} onChange={e => setNewLecture(p => ({ ...p, title: e.target.value }))} required />
                    <textarea className={fieldClass} placeholder="Description" rows={2} value={newLecture.description} onChange={e => setNewLecture(p => ({ ...p, description: e.target.value }))} />
                    <input className={fieldClass} placeholder="Video URL (YouTube/Vimeo)" value={newLecture.video_url} onChange={e => setNewLecture(p => ({ ...p, video_url: e.target.value }))} required />
                    <button type="submit" className={btnClass} disabled={submitting}><Upload className="w-4 h-4" />Upload Lecture</button>
                  </form>
                </div>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {lectures.filter((l: any) => !selectedCourseId || l.course === selectedCourseId).map((l: any) => (
                    <motion.div key={l.id} whileHover={{ y: -2 }}
                      className="bg-card border border-border rounded-2xl p-4 flex items-start justify-between gap-3">
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Video className="w-4 h-4 text-primary flex-shrink-0" />
                          <h4 className="font-semibold text-sm truncate">{l.title}</h4>
                        </div>
                        <p className="text-xs text-foreground/60 line-clamp-1 mb-2">{l.description}</p>
                        {l.video_url && (
                          <a href={l.video_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            <ExternalLink className="w-3 h-3" />Watch Video
                          </a>
                        )}
                      </div>
                      <button onClick={() => handleDeleteLecture(l.id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                  {lectures.length === 0 && <p className="text-foreground/50 text-sm text-center py-8">No lectures uploaded yet.</p>}
                </div>
              </div>
            )}

            {/* ASSIGNMENTS */}
            {activeTab === "Assignments" && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" />Create Assignment</h3>
                  <form onSubmit={handleAddAssignment} className="space-y-3">
                    <select value={newAssignment.course} onChange={e => setNewAssignment(p => ({ ...p, course: e.target.value }))} className={fieldClass} required>
                      <option value="">Select Course</option>
                      {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <input className={fieldClass} placeholder="Assignment Title" value={newAssignment.title} onChange={e => setNewAssignment(p => ({ ...p, title: e.target.value }))} required />
                    <textarea className={fieldClass} placeholder="Instructions" rows={3} value={newAssignment.description} onChange={e => setNewAssignment(p => ({ ...p, description: e.target.value }))} required />
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-foreground/60 font-bold">Assignment File (PDF, Word, PPT, etc.)</label>
                      <div className="relative group">
                        <input type="file" onChange={e => setAssignmentFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="bg-card border-2 border-dashed border-border group-hover:border-primary/50 rounded-xl p-4 flex items-center justify-center gap-2 transition-all">
                          <Upload className="w-4 h-4 text-primary" />
                          <span className="text-xs font-semibold text-foreground/70">
                            {assignmentFile ? assignmentFile.name : "Click to upload file"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <label className="text-xs text-foreground/60 font-bold">Deadline</label>
                    <input type="datetime-local" className={fieldClass} value={newAssignment.due_date} onChange={e => setNewAssignment(p => ({ ...p, due_date: e.target.value }))} required />
                    <button type="submit" className={btnClass} disabled={submitting}><Plus className="w-4 h-4" />Create Assignment</button>
                  </form>
                </div>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {assignments.filter((a: any) => !selectedCourseId || a.course === selectedCourseId).map((a: any) => (
                    <motion.div key={a.id} whileHover={{ y: -2 }}
                      className="bg-card border border-border rounded-2xl p-4">
                      <h4 className="font-semibold text-sm mb-1">{a.title}</h4>
                      <p className="text-xs text-foreground/60 line-clamp-2 mb-2">{a.description}</p>
                      {a.file_attachment && (
                        <a href={a.file_attachment} target="_blank" rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1.5 p-1.5 rounded-lg bg-primary/5 text-primary text-[10px] font-bold hover:bg-primary/10 transition-all mb-2">
                          <File className="w-3 h-3" /> View Material
                        </a>
                      )}
                      <p className="text-xs text-orange-500 font-semibold">📅 Due: {new Date(a.due_date).toLocaleDateString()}</p>
                    </motion.div>
                  ))}
                  {assignments.length === 0 && <p className="text-foreground/50 text-sm text-center py-8">No assignments yet.</p>}
                </div>
              </div>
            )}

            {/* QUIZZES */}
            {activeTab === "Quizzes" && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" />Create Quiz</h3>
                  <form onSubmit={handleAddQuiz} className="space-y-3">
                    <select value={newQuiz.course} onChange={e => setNewQuiz(p => ({ ...p, course: e.target.value }))} className={fieldClass} required>
                      <option value="">Select Course</option>
                      {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <input className={fieldClass} placeholder="Quiz Title" value={newQuiz.title} onChange={e => setNewQuiz(p => ({ ...p, title: e.target.value }))} required />
                    <textarea className={fieldClass} placeholder="Description" rows={2} value={newQuiz.description} onChange={e => setNewQuiz(p => ({ ...p, description: e.target.value }))} />
                    <div className="flex gap-3">
                      <input type="number" className={fieldClass} placeholder="Time (minutes)" value={newQuiz.time_limit_minutes} onChange={e => setNewQuiz(p => ({ ...p, time_limit_minutes: Number(e.target.value) }))} min={5} />
                      <input type="datetime-local" className={fieldClass} value={newQuiz.due_date} onChange={e => setNewQuiz(p => ({ ...p, due_date: e.target.value }))} />
                    </div>
                    <button type="submit" className={btnClass} disabled={submitting}><Plus className="w-4 h-4" />Create Quiz</button>
                  </form>
                </div>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {quizzes.filter((q: any) => !selectedCourseId || q.course === selectedCourseId).map((q: any) => (
                    <motion.div key={q.id} whileHover={{ y: -2 }}
                      className="bg-card border border-border rounded-2xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">{q.title}</h4>
                          <p className="text-xs text-foreground/60 mt-1">{q.questions?.length || 0} questions · {q.time_limit_minutes} min</p>
                        </div>
                      </div>
                      {q.due_date && <p className="text-xs text-orange-500 mt-2 font-semibold">📅 Due: {new Date(q.due_date).toLocaleDateString()}</p>}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBMISSIONS */}
            {activeTab === "Submissions" && (
              <div className="space-y-4">
                {submissions.filter((s: any) => !selectedCourseId || s.assignment_course === selectedCourseId || assignments.find(a => a.id === s.assignment)?.course === selectedCourseId).map((s: any) => (
                  <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-foreground/50 uppercase font-semibold tracking-wide">Student</p>
                        <button onClick={() => setViewingStudent({ id: s.student, full_name: s.student_name, username: s.student_username })}
                          className="font-bold text-primary hover:underline">
                          {s.student_name || s.student_username}
                        </button>
                        <p className="text-xs text-foreground/60 mt-1">Assignment: {assignments.find(a => a.id === s.assignment)?.title || 'Assigned Task'}</p>
                      </div>
                      {s.grade != null
                        ? <span className="text-xl font-black text-primary bg-primary/10 px-4 py-2 rounded-xl">{s.grade}/100</span>
                        : <span className="text-xs font-semibold text-orange-500 bg-orange-100 px-3 py-1.5 rounded-lg">Pending Grade</span>
                      }
                    </div>
                    {/* ... rest of grading UI */}
                  </motion.div>
                ))}
                {submissions.length === 0 && <p className="text-foreground/50 text-sm text-center py-8">No submissions yet.</p>}
              </div>
            )}

            {/* STUDENTS TAB */}
            {activeTab === "Students" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Enrolled Students</h2>
                  {selectedCourseId && <p className="text-xs font-bold text-primary">Showing for: {courses.find(c => c.id === selectedCourseId)?.title}</p>}
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrollments.filter(e => !selectedCourseId || e.course === selectedCourseId).map((e: any) => (
                    <motion.div key={e.id} whileHover={{ scale: 1.02 }} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center text-xl font-black">
                        {(e.student_name || e.student_username)[0].toUpperCase()}
                      </div>
                      <div className="flex-grow min-w-0">
                        <button onClick={() => setViewingStudent({ id: e.student, full_name: e.student_name, username: e.student_username })}
                          className="font-bold truncate hover:text-primary transition-colors block text-left w-full">
                          {e.student_name || e.student_username}
                        </button>
                        <p className="text-xs text-foreground/50 truncate">Course: {e.course_name}</p>
                        <div className="mt-2">
                          <ProgressBar progress={e.progress} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {enrollments.filter(e => !selectedCourseId || e.course === selectedCourseId).length === 0 && (
                    <p className="col-span-full text-center py-12 text-foreground/40 italic">No students found for this selection.</p>
                  )}
                </div>
              </div>
            )}

            {/* ANNOUNCE */}
            {activeTab === "Announce" && (
              <div className="max-w-xl">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-bold mb-2 flex items-center gap-2"><Megaphone className="w-4 h-4 text-primary" />Send Announcement</h3>
                  <p className="text-xs text-foreground/60 mb-5">Leave "Target Course" blank to send to ALL students globally.</p>
                  <form onSubmit={handleSendAnnouncement} className="space-y-3">
                    <select value={announcement.course} onChange={e => setAnnouncement(p => ({ ...p, course: e.target.value }))} className={fieldClass}>
                      <option value="">🌍 All Students (Global)</option>
                      {courses.map((c: any) => <option key={c.id} value={c.id}>📚 {c.title} only</option>)}
                    </select>
                    <input className={fieldClass} placeholder="Announcement Title" value={announcement.title} onChange={e => setAnnouncement(p => ({ ...p, title: e.target.value }))} required />
                    <textarea className={fieldClass} placeholder="Write your announcement..." rows={5} value={announcement.content} onChange={e => setAnnouncement(p => ({ ...p, content: e.target.value }))} required />
                    <button type="submit" className={btnClass} disabled={submitting}>
                      <Send className="w-4 h-4" />{announcement.course ? "Send to Course Students" : "Send to All Students"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── STUDENT PROFILE MODAL ── */}
        <AnimatePresence>
          {viewingStudent && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                <button onClick={() => setViewingStudent(null)} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-secondary/50 transition-all"><X className="w-5 h-5" /></button>
                
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center text-3xl font-black text-accent mb-4">
                    {(viewingStudent.full_name || viewingStudent.username)[0].toUpperCase()}
                  </div>
                  <h3 className="text-2xl font-black">{viewingStudent.full_name || viewingStudent.username}</h3>
                  <p className="text-foreground/60 font-medium">Student ID: {viewingStudent.username}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/40 text-center mb-4">Course Progress for this Student</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                    {enrollments.filter(e => e.student === viewingStudent.id).map(e => (
                      <div key={e.id} className="p-4 bg-secondary/30 border border-border rounded-2xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold">{e.course_name}</span>
                          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-md">{e.progress}%</span>
                        </div>
                        <ProgressBar progress={e.progress} />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── START LIVE MODAL ── */}
        <AnimatePresence>
          {liveCourseId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                <button onClick={() => setLiveCourseId(null)} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-secondary/50 transition-all"><X className="w-5 h-5" /></button>
                <h3 className="text-xl font-black mb-1">🔴 Start Live Session</h3>
                <p className="text-xs text-foreground/50 mb-6">Enter your Zoom/Google Meet link to notify students.</p>

                <form onSubmit={handleStartLive} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-foreground/60 mb-1.5 block">Session Title</label>
                    <input className={fieldClass} value={liveForm.title} onChange={e => setLiveForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Q&A and Review" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground/60 mb-1.5 block">Meeting Link (Zoom/Meet/Teams)</label>
                    <input className={fieldClass} value={liveForm.meeting_link} onChange={e => setLiveForm(p => ({ ...p, meeting_link: e.target.value }))} placeholder="https://zoom.us/j/..." />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2">
                    {submitting ? "Starting..." : <><Video className="w-4 h-4" /> Start Broadcast Now</>}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
