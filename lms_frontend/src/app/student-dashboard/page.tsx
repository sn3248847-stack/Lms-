"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import ProgressBar from "@/components/ProgressBar";
import SearchBar from "@/components/SearchBar";
import Leaderboard from "@/components/Leaderboard";
import DarkModeToggle from "@/components/DarkModeToggle";
import {
  GraduationCap, BookOpen, Video, FileText, ClipboardList,
  BarChart2, Bell, Megaphone, LogOut, Trophy, Upload, Check, X, ExternalLink
} from "lucide-react";

const TABS = ["Courses", "Quizzes", "Assignments", "Results", "Notifications", "Leaderboard"];
const TAB_ICONS: any = {
  Courses: <BookOpen className="w-4 h-4" />,
  Quizzes: <ClipboardList className="w-4 h-4" />,
  Assignments: <FileText className="w-4 h-4" />,
  Results: <BarChart2 className="w-4 h-4" />,
  Notifications: <Bell className="w-4 h-4" />,
  Leaderboard: <Trophy className="w-4 h-4" />,
};

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [viewingInstructor, setViewingInstructor] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);

  // Data
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);

  // Quiz attempt state
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // File submission state
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [enrollRes, courseRes, quizRes, quizResultRes, assignRes, subRes, notifRes, annRes, lbRes, lecRes, liveRes] =
        await Promise.all([
          api.get("enrollments/"),
          api.get("courses/"),
          api.get("quizzes/"),
          api.get("quiz-results/"),
          api.get("assignments/"),
          api.get("submissions/"),
          api.get("notifications/"),
          api.get("announcements/"),
          api.get("quiz-results/leaderboard/"),
          api.get("lectures/"),
          api.get("liveclasses/")
        ]);
      setEnrollments(enrollRes.data);
      setAllCourses(courseRes.data);
      setQuizzes(quizRes.data);
      setQuizResults(quizResultRes.data);
      setAssignments(assignRes.data);
      setSubmissions(subRes.data);
      setNotifications(notifRes.data);
      setAnnouncements(annRes.data);
      setLeaderboard(lbRes.data);
      setLectures(lecRes.data);
      setLiveClasses(liveRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get("users/me/");
        if (res.data.role !== "STUDENT") router.push("/login");
        else { setUser(res.data); fetchData(); }
      } catch { router.push("/login"); }
    };
    init();
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("access_token"); Cookies.remove("refresh_token"); Cookies.remove("user_role");
    router.push("/login");
  };

  const handleEnroll = async (courseId: number) => {
    try {
      await api.post("enrollments/", { course: courseId, student: user.id, progress: 0 });
      fetchData();
    } catch { alert("Already enrolled or an error occurred."); }
  };

  const handleMarkNotification = async (id: number) => {
    try {
      await api.patch(`notifications/${id}/`, { is_read: true });
      setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
    } catch { }
  };

  // MCQ Auto-grading
  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    let correct = 0;
    let total = 0;
    activeQuiz.questions.forEach((q: any) => {
      q.choices.forEach((c: any) => {
        if (c.id === selectedAnswers[q.id] && c.is_correct) correct++;
      });
      total++;
    });
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    setQuizScore(score);
    setQuizSubmitted(true);
    try {
      await api.post("quiz-results/", { quiz: activeQuiz.id, score });
      fetchData();
    } catch { }
  };

  // Assignment file submission
  const handleSubmitAssignment = async (assignmentId: number) => {
    if (!submissionFile) return alert("Please select a file first.");
    const form = new FormData();
    form.append("assignment", String(assignmentId));
    form.append("file_attachment", submissionFile);
    try {
      await api.post("submissions/", form, { headers: { "Content-Type": "multipart/form-data" } });
      alert("Assignment submitted successfully!");
      setSubmissionFile(null);
      setSubmittingAssignmentId(null);
      fetchData();
    } catch { alert("Error submitting. Already submitted?"); }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const enrolledIds = enrollments.map((e: any) => e.course);
  const filteredCourses = allCourses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;
  const submittedIds = submissions.map((s: any) => s.assignment);

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 p-4 glass rounded-2xl border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-xl">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Student Dashboard</h1>
              <p className="text-xs text-foreground/60">Welcome back, <span className="text-primary font-semibold">{user.username}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-border hover:bg-secondary/60 transition-all">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </motion.header>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Enrolled", value: enrollments.length, icon: <BookOpen className="w-5 h-5 text-primary" />, color: "from-primary/10" },
            { label: "Quizzes Done", value: quizResults.length, icon: <ClipboardList className="w-5 h-5 text-accent" />, color: "from-accent/10" },
            { label: "Assignments", value: submissions.length, icon: <FileText className="w-5 h-5 text-purple-500" />, color: "from-purple-500/10" },
            { label: "Notifications", value: unreadCount, icon: <Bell className="w-5 h-5 text-orange-500" />, color: "from-orange-500/10" },
          ].map((s, i) => (
            <motion.div key={i} whileHover={{ y: -3 }}
              className={`bg-card border border-border rounded-2xl p-4 bg-gradient-to-br ${s.color} to-transparent`}>
              <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-xs text-foreground/60">{s.label}</span></div>
              <div className="text-2xl font-black">{s.value}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Announcement Banner */}
        {announcements.length > 0 && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-start gap-3">
            <Megaphone className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm">{announcements[0].title}</div>
              <div className="text-xs text-white/80 mt-0.5">{announcements[0].content}</div>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-card border border-border hover:bg-secondary/50 text-foreground/70"
              }`}
            >
              {TAB_ICONS[tab]}
              {tab}
              {tab === "Notifications" && unreadCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >

            {/* ===== COURSES TAB ===== */}
            {activeTab === "Courses" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">My Enrolled Courses</h2>
                  {selectedCourse && <button onClick={() => setSelectedCourse(null)} className="text-sm text-primary font-bold hover:underline">← Back to all</button>}
                </div>

                {/* 🔴 LIVE CLASS BANNER */}
                {!selectedCourse && liveClasses.length > 0 && (
                  <div className="mb-8 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" /> Live Classes Now
                    </h3>
                    <div className="grid gap-3">
                      {liveClasses.map((lc: any) => (
                        <motion.div key={lc.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                          className="bg-red-500 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-red-500/20">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                              <Video className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-black leading-tight">{lc.title}</p>
                              <p className="text-[10px] opacity-80 font-bold uppercase tracking-tighter">{lc.course_name}</p>
                            </div>
                          </div>
                          <a href={lc.meeting_link} target="_blank" rel="noopener noreferrer"
                            className="bg-white text-red-500 px-6 py-2 rounded-xl text-xs font-black hover:bg-opacity-90 transition-all flex items-center gap-2">
                            Join Session <ExternalLink className="w-3 h-3" />
                          </a>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCourse ? (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-black text-primary">{selectedCourse.course_name}</h3>
                          <button onClick={() => {
                            const instName = allCourses.find(c => c.id === selectedCourse.course)?.instructor_name;
                            const instId = allCourses.find(c => c.id === selectedCourse.course)?.instructor;
                            if (instName) setViewingInstructor({ username: instName, id: instId });
                          }} className="text-sm text-foreground/60 font-semibold hover:text-primary transition-colors underline decoration-primary/30 underline-offset-2">
                            Instructor: {allCourses.find(c => c.id === selectedCourse.course)?.instructor_name || "Assigned Instructor"}
                          </button>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-xl text-primary font-bold text-sm">Progress: {selectedCourse.progress}%</div>
                      </div>
                      <ProgressBar progress={selectedCourse.progress} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Lectures Section */}
                      <div className="space-y-4">
                        <h4 className="font-bold flex items-center gap-2"><Video className="w-4 h-4 text-primary" />Lectures</h4>
                        <div className="space-y-3">
                          {lectures.filter(l => l.course === selectedCourse.course).map(l => (
                            <div key={l.id} className="p-4 bg-card border border-border rounded-xl flex items-center justify-between gap-3 group hover:border-primary/30 transition-all">
                              <div className="flex-grow min-w-0">
                                <p className="font-bold text-sm truncate">{l.title}</p>
                                <p className="text-xs text-foreground/50 line-clamp-1">{l.description}</p>
                              </div>
                              <button onClick={() => window.open(l.video_url, "_blank")} className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                <Video className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {lectures.filter(l => l.course === selectedCourse.course).length === 0 && <p className="text-xs text-foreground/40 italic">No lectures uploaded yet.</p>}
                        </div>
                      </div>

                      {/* Quizzes & Assignments Section */}
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="font-bold flex items-center gap-2"><ClipboardList className="w-4 h-4 text-accent" />Available Quizzes</h4>
                          <div className="space-y-3">
                            {quizzes.filter(q => q.course === selectedCourse.course).map(q => (
                              <div key={q.id} className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
                                <span className="text-sm font-bold">{q.title}</span>
                                <button onClick={() => { setActiveTab("Quizzes"); setSelectedCourse(null); }} className="text-xs font-bold text-accent hover:underline">Go to Quiz</button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-purple-500" />Course Assignments</h4>
                          <div className="space-y-3">
                            {assignments.filter(a => a.course === selectedCourse.course).map(a => (
                              <div key={a.id} className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
                                <span className="text-sm font-bold">{a.title}</span>
                                <button onClick={() => { setActiveTab("Assignments"); setSelectedCourse(null); }} className="text-xs font-bold text-purple-500 hover:underline">Submit Now</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {enrollments.length > 0 && (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {enrollments.map((e: any) => (
                          <motion.div key={e.id} whileHover={{ y: -4 }}
                            className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm group">
                            <div className="h-2 bg-gradient-to-r from-primary to-accent" style={{ width: `${e.progress}%`, minWidth: "2%" }} />
                            <div className="p-5">
                              <h3 className="font-bold mb-3 group-hover:text-primary transition-colors">{e.course_name}</h3>
                              <ProgressBar progress={e.progress} label="Overall Progress" />
                              <button onClick={() => setSelectedCourse(e)}
                                className="w-full mt-4 py-2 border border-primary/20 text-primary text-xs font-bold rounded-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2">
                                <BookOpen className="w-3 h-3" /> View Course Portal
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    <h2 className="text-xl font-bold mb-4">Explore All Courses</h2>
                    {/* ... (rest of search and all courses grid) */}
                <div className="mb-4">
                  <SearchBar onSearch={setSearchQuery} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCourses.map((course: any) => {
                    const enrolled = enrolledIds.includes(course.id);
                    return (
                      <motion.div key={course.id} whileHover={{ y: -4 }}
                        className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-bold">{course.title}</h3>
                        <p className="text-sm text-foreground/60 line-clamp-2">{course.description}</p>
                        <p className="text-xs text-foreground/50">by {course.instructor_name}</p>
                        {enrolled ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-3 py-1.5 rounded-lg w-fit">
                            <Check className="w-3 h-3" /> Enrolled
                          </span>
                        ) : (
                          <button onClick={() => handleEnroll(course.id)}
                            className="mt-auto w-full py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all">
                            Enroll Now
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                  </div>
              </>
            )}
          </div>
        )}

            {/* ===== QUIZZES TAB ===== */}
            {activeTab === "Quizzes" && (
              <div>
                {activeQuiz ? (
                  <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                      <button onClick={() => { setActiveQuiz(null); setQuizSubmitted(false); setSelectedAnswers({}); }}
                        className="p-2 rounded-xl border border-border hover:bg-secondary/50 transition-all">
                        <X className="w-4 h-4" />
                      </button>
                      <h2 className="text-xl font-bold">{activeQuiz.title}</h2>
                    </div>

                    {quizSubmitted ? (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="bg-card border border-border rounded-2xl p-8 text-center">
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-black mb-4 ${quizScore >= 60 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                          {quizScore}%
                        </div>
                        <h3 className="font-bold text-xl mb-2">{quizScore >= 60 ? "🎉 Well done!" : "Keep practicing!"}</h3>
                        <p className="text-foreground/60 text-sm">Your score has been saved automatically.</p>
                        <button onClick={() => { setActiveQuiz(null); setQuizSubmitted(false); setSelectedAnswers({}); }}
                          className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all">
                          Back to Quizzes
                        </button>
                      </motion.div>
                    ) : (
                      <div className="space-y-6">
                        {activeQuiz.questions.map((q: any, qi: number) => (
                          <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: qi * 0.05 } }}
                            className="bg-card border border-border rounded-2xl p-5">
                            <p className="font-semibold mb-4 text-sm">Q{qi + 1}. {q.text}</p>
                            <div className="space-y-2">
                              {q.choices.map((c: any) => (
                                <button key={c.id}
                                  onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: c.id }))}
                                  className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all ${
                                    selectedAnswers[q.id] === c.id
                                      ? "bg-primary text-white border-primary"
                                      : "bg-secondary/30 border-border hover:bg-secondary/60"
                                  }`}>{c.text}</button>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                        <button onClick={handleSubmitQuiz}
                          className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                          Submit Quiz — Auto Grade
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quizzes.map((quiz: any) => {
                      const done = quizResults.find((r: any) => r.quiz === quiz.id);
                      return (
                        <motion.div key={quiz.id} whileHover={{ y: -4 }}
                          className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-primary" />
                            <h3 className="font-bold line-clamp-1">{quiz.title}</h3>
                          </div>
                          <p className="text-xs text-foreground/60">{quiz.description}</p>
                          <p className="text-xs text-foreground/50">⏱ {quiz.time_limit_minutes} min &nbsp;|&nbsp; {quiz.questions?.length || 0} questions</p>
                          {done ? (
                            <div className="mt-auto pt-3 border-t border-border">
                              <ProgressBar progress={Number(done.score)} label={`Score: ${done.score}%`} />
                            </div>
                          ) : (
                            <button onClick={() => { setActiveQuiz(quiz); setSelectedAnswers({}); setQuizSubmitted(false); }}
                              className="mt-auto py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all">
                              Attempt Quiz
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ===== ASSIGNMENTS TAB ===== */}
            {activeTab === "Assignments" && (
              <div className="grid md:grid-cols-2 gap-4">
                {assignments.map((asgn: any) => {
                  const submitted = submittedIds.includes(asgn.id);
                  const isOpen = submittingAssignmentId === asgn.id;
                  return (
                    <motion.div key={asgn.id} whileHover={{ y: -3 }}
                      className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold">{asgn.title}</h3>
                        {submitted && <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-lg flex-shrink-0"><Check className="w-3 h-3" />Submitted</span>}
                      </div>
                      <p className="text-sm text-foreground/60">{asgn.description}</p>
                      <p className="text-xs text-orange-500 font-semibold">📅 Due: {new Date(asgn.due_date).toLocaleDateString()}</p>

                      {!submitted && (
                        <>
                          <button onClick={() => setSubmittingAssignmentId(isOpen ? null : asgn.id)}
                            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all">
                            <Upload className="w-4 h-4" /> {isOpen ? "Cancel" : "Upload Submission"}
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                                <input type="file" onChange={e => setSubmissionFile(e.target.files?.[0] || null)}
                                  className="w-full text-sm text-foreground/70 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-semibold hover:file:bg-primary/20 transition-all" />
                                <button onClick={() => handleSubmitAssignment(asgn.id)}
                                  className="w-full py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary/90 transition-all">
                                  Submit Assignment
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ===== RESULTS TAB ===== */}
            {activeTab === "Results" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-4">My Results</h2>
                {quizResults.length === 0 && submissions.filter((s: any) => s.grade).length === 0 && (
                  <p className="text-foreground/50 text-sm italic text-center py-8">No results yet. Complete a quiz or assignment to see results here.</p>
                )}
                {quizResults.map((r: any) => (
                  <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="text-xs text-foreground/50">Quiz Result</span>
                        <h3 className="font-bold">Quiz ID: {r.quiz}</h3>
                      </div>
                      <span className={`text-xl font-black ${Number(r.score) >= 60 ? "text-green-500" : "text-red-500"}`}>{r.score}%</span>
                    </div>
                    <ProgressBar progress={Number(r.score)} />
                    {r.plagiarism_score != null && (
                      <p className="text-xs text-foreground/50 mt-3">🔍 Plagiarism check: <span className="font-semibold text-orange-500">{r.plagiarism_score}%</span> — {r.plagiarism_report}</p>
                    )}
                  </motion.div>
                ))}
                {submissions.filter((s: any) => s.grade).map((s: any) => (
                  <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="text-xs text-foreground/50">Assignment Grade</span>
                        <h3 className="font-bold">Assignment ID: {s.assignment}</h3>
                      </div>
                      <span className="text-xl font-black text-primary">{s.grade}/100</span>
                    </div>
                    {s.feedback && <p className="text-sm text-foreground/60 mt-2 p-3 bg-secondary/30 rounded-xl">💬 {s.feedback}</p>}
                    {s.plagiarism_score != null && (
                      <p className="text-xs text-foreground/50 mt-3">🔍 Plagiarism: <span className="font-semibold text-orange-500">{s.plagiarism_score}%</span> — {s.plagiarism_report}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== NOTIFICATIONS TAB ===== */}
            {activeTab === "Notifications" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Notifications</h2>
                  {unreadCount > 0 && <span className="text-xs bg-red-100 text-red-600 font-semibold px-3 py-1 rounded-full">{unreadCount} unread</span>}
                </div>
                {notifications.length === 0 && <p className="text-foreground/50 text-sm italic text-center py-8">All caught up! No notifications.</p>}
                {notifications.map((n: any) => (
                  <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${n.is_read ? "bg-card border-border opacity-60" : "bg-primary/5 border-primary/30"}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? "bg-foreground/20" : "bg-primary"}`} />
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-sm">{n.title}</p>
                      <p className="text-xs text-foreground/60 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    {!n.is_read && (
                      <button onClick={() => handleMarkNotification(n.id)}
                        className="flex-shrink-0 p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-all">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== LEADERBOARD TAB ===== */}
            {activeTab === "Leaderboard" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-1">Quiz Leaderboard</h2>
                  <p className="text-foreground/60 text-sm">See how you rank among your peers.</p>
                </div>
                <Leaderboard entries={leaderboard} />
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ── INSTRUCTOR PROFILE MODAL ── */}
        <AnimatePresence>
          {viewingInstructor && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                <button onClick={() => setViewingInstructor(null)} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-secondary/50 transition-all"><X className="w-5 h-5" /></button>
                
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-black text-primary mb-4">
                    {viewingInstructor.username[0].toUpperCase()}
                  </div>
                  <h3 className="text-2xl font-black">{viewingInstructor.username}</h3>
                  <p className="text-foreground/60 font-medium">Expert Instructor</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/40 text-center mb-4">Courses Taught by this Instructor</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                    {allCourses.filter(c => c.instructor === viewingInstructor.id || c.instructor_name === viewingInstructor.username).map(c => (
                      <div key={c.id} className="p-4 bg-secondary/30 border border-border rounded-2xl flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span className="text-sm font-bold">{c.title}</span>
                        </div>
                        {!enrolledIds.includes(c.id) && (
                          <button onClick={() => handleEnroll(c.id)} className="text-[10px] font-black uppercase tracking-tighter bg-primary text-white px-2 py-1 rounded-md hover:scale-105 transition-all">Enroll</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
