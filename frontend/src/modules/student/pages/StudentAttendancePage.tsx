import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../hooks/useStudent';

interface PeriodRecord {
  period: number;
  timeSlot: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  venue: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_DUTY';
  markedAt: string;
  verificationMethod: 'Biometric' | 'RFID Card' | 'Faculty QR' | 'Manual Log';
  topic: string;
}

interface DayAttendance {
  dayName: string;
  dateStr: string;
  periods: PeriodRecord[];
}

export const StudentAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const { dashboard, classData, subjects } = useStudent();

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_DUTY'>('ALL');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showOdModal, setShowOdModal] = useState(false);
  const [odSubmitted, setOdSubmitted] = useState(false);
  const [odReason, setOdReason] = useState('Hackathon');
  const [odPeriod, setOdPeriod] = useState('All Day');

  // Realistic demo attendance data across the week (6 periods per day)
  const weekAttendance: DayAttendance[] = [
    {
      dayName: 'Today (Friday)',
      dateStr: 'Oct 03, 2026',
      periods: [
        {
          period: 1,
          timeSlot: '09:00 AM - 09:50 AM',
          courseCode: 'AIML301',
          courseName: 'Deep Learning & Neural Architectures',
          facultyName: 'Dr. Sarah Jenkins',
          venue: 'Lecture Hall 302 (Block A)',
          status: 'PRESENT',
          markedAt: '09:02 AM',
          verificationMethod: 'Biometric',
          topic: 'Backpropagation and Convolutional Kernels',
        },
        {
          period: 2,
          timeSlot: '09:55 AM - 10:45 AM',
          courseCode: 'AIML302',
          courseName: 'Distributed Cloud Computing Systems',
          facultyName: 'Prof. Marcus Vance',
          venue: 'Cloud Computing Lab 4',
          status: 'PRESENT',
          markedAt: '09:56 AM',
          verificationMethod: 'RFID Card',
          topic: 'Kubernetes Pod Orchestration & Autoscaling',
        },
        {
          period: 3,
          timeSlot: '11:00 AM - 11:50 AM',
          courseCode: 'AIML303',
          courseName: 'Computer Vision & Scene Understanding',
          facultyName: 'Dr. Ananya Sharma',
          venue: 'CV Research Wing 2',
          status: 'PRESENT',
          markedAt: '11:01 AM',
          verificationMethod: 'Faculty QR',
          topic: 'Feature Extraction with SIFT and ORB',
        },
        {
          period: 4,
          timeSlot: '11:55 AM - 12:45 PM',
          courseCode: 'MATH202',
          courseName: 'Mathematical Optimization & Linear Algebra',
          facultyName: 'Prof. David Chen',
          venue: 'Mathematics Auditorium B',
          status: 'LATE',
          markedAt: '12:08 PM',
          verificationMethod: 'Manual Log',
          topic: 'Convex Optimization and Dual Simplex',
        },
        {
          period: 5,
          timeSlot: '01:45 PM - 02:35 PM',
          courseCode: 'AIML305',
          courseName: 'Reinforcement Learning & Robotics Lab',
          facultyName: 'Dr. Sarah Jenkins & Mentors',
          venue: 'AI Innovation Sandbox Lab',
          status: 'PRESENT',
          markedAt: '01:46 PM',
          verificationMethod: 'Biometric',
          topic: 'Q-Learning Convergence on Gridworld',
        },
        {
          period: 6,
          timeSlot: '02:40 PM - 03:30 PM',
          courseCode: 'PRJ310',
          courseName: 'Capstone Project & Industry Mentorship',
          facultyName: 'Dr. Rajesh Kumar',
          venue: 'Technology Incubation Cell',
          status: 'ON_DUTY',
          markedAt: '02:30 PM',
          verificationMethod: 'Manual Log',
          topic: 'National AI Hackathon Prototype Defense',
        },
      ],
    },
    {
      dayName: 'Yesterday (Thursday)',
      dateStr: 'Oct 02, 2026',
      periods: [
        {
          period: 1,
          timeSlot: '09:00 AM - 09:50 AM',
          courseCode: 'AIML302',
          courseName: 'Distributed Cloud Computing Systems',
          facultyName: 'Prof. Marcus Vance',
          venue: 'Cloud Computing Lab 4',
          status: 'PRESENT',
          markedAt: '09:01 AM',
          verificationMethod: 'Biometric',
          topic: 'Microservices & Service Meshes',
        },
        {
          period: 2,
          timeSlot: '09:55 AM - 10:45 AM',
          courseCode: 'AIML301',
          courseName: 'Deep Learning & Neural Architectures',
          facultyName: 'Dr. Sarah Jenkins',
          venue: 'Lecture Hall 302 (Block A)',
          status: 'PRESENT',
          markedAt: '09:57 AM',
          verificationMethod: 'RFID Card',
          topic: 'Residual Networks and Skip Connections',
        },
        {
          period: 3,
          timeSlot: '11:00 AM - 11:50 AM',
          courseCode: 'MATH202',
          courseName: 'Mathematical Optimization & Linear Algebra',
          facultyName: 'Prof. David Chen',
          venue: 'Mathematics Auditorium B',
          status: 'PRESENT',
          markedAt: '11:03 AM',
          verificationMethod: 'Faculty QR',
          topic: 'Eigenvalue Decompositions & SVD',
        },
        {
          period: 4,
          timeSlot: '11:55 AM - 12:45 PM',
          courseCode: 'ENG204',
          courseName: 'Technical Writing & Academic Publishing',
          facultyName: 'Dr. Helen Brooks',
          venue: 'Seminar Hall 1',
          status: 'PRESENT',
          markedAt: '11:56 AM',
          verificationMethod: 'Biometric',
          topic: 'Peer Review Workflows and IEEE Formats',
        },
        {
          period: 5,
          timeSlot: '01:45 PM - 02:35 PM',
          courseCode: 'AIML303',
          courseName: 'Computer Vision & Scene Understanding',
          facultyName: 'Dr. Ananya Sharma',
          venue: 'CV Research Wing 2',
          status: 'PRESENT',
          markedAt: '01:46 AM',
          verificationMethod: 'Biometric',
          topic: 'YOLOv10 Real-time Object Detection',
        },
        {
          period: 6,
          timeSlot: '02:40 PM - 03:30 PM',
          courseCode: 'AIML305',
          courseName: 'Reinforcement Learning & Robotics Lab',
          facultyName: 'Dr. Sarah Jenkins',
          venue: 'AI Innovation Sandbox Lab',
          status: 'PRESENT',
          markedAt: '02:41 PM',
          verificationMethod: 'RFID Card',
          topic: 'Policy Gradient Methods in PyTorch',
        },
      ],
    },
    {
      dayName: 'Wednesday',
      dateStr: 'Oct 01, 2026',
      periods: [
        {
          period: 1,
          timeSlot: '09:00 AM - 09:50 AM',
          courseCode: 'AIML303',
          courseName: 'Computer Vision & Scene Understanding',
          facultyName: 'Dr. Ananya Sharma',
          venue: 'CV Research Wing 2',
          status: 'PRESENT',
          markedAt: '09:03 AM',
          verificationMethod: 'Biometric',
          topic: 'Image Segmentation with U-Net',
        },
        {
          period: 2,
          timeSlot: '09:55 AM - 10:45 AM',
          courseCode: 'MATH202',
          courseName: 'Mathematical Optimization & Linear Algebra',
          facultyName: 'Prof. David Chen',
          venue: 'Mathematics Auditorium B',
          status: 'PRESENT',
          markedAt: '09:56 AM',
          verificationMethod: 'Faculty QR',
          topic: 'Lagrangian Multipliers',
        },
        {
          period: 3,
          timeSlot: '11:00 AM - 11:50 AM',
          courseCode: 'AIML301',
          courseName: 'Deep Learning & Neural Architectures',
          facultyName: 'Dr. Sarah Jenkins',
          venue: 'Lecture Hall 302',
          status: 'PRESENT',
          markedAt: '11:02 AM',
          verificationMethod: 'Biometric',
          topic: 'Transformers & Self-Attention',
        },
        {
          period: 4,
          timeSlot: '11:55 AM - 12:45 PM',
          courseCode: 'AIML302',
          courseName: 'Distributed Cloud Computing Systems',
          facultyName: 'Prof. Marcus Vance',
          venue: 'Cloud Computing Lab 4',
          status: 'LATE',
          markedAt: '12:05 PM',
          verificationMethod: 'Manual Log',
          topic: 'Serverless Functions & Event Queues',
        },
        {
          period: 5,
          timeSlot: '01:45 PM - 02:35 PM',
          courseCode: 'PRJ310',
          courseName: 'Capstone Project & Industry Mentorship',
          facultyName: 'Dr. Rajesh Kumar',
          venue: 'Incubation Lab',
          status: 'PRESENT',
          markedAt: '01:48 PM',
          verificationMethod: 'Biometric',
          topic: 'Sprint Review 3: Model Evaluation',
        },
        {
          period: 6,
          timeSlot: '02:40 PM - 03:30 PM',
          courseCode: 'LIB101',
          courseName: 'Library & Guided Literature Research',
          facultyName: 'Chief Librarian',
          venue: 'Central Digital Library',
          status: 'PRESENT',
          markedAt: '02:42 PM',
          verificationMethod: 'RFID Card',
          topic: 'Scholarly Indexing & Citations',
        },
      ],
    },
  ];

  const currentDay = weekAttendance[selectedDayIndex];

  // Filter periods by status
  const filteredPeriods = currentDay.periods.filter((p) => {
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  // Calculate daily stats
  const presentCount = currentDay.periods.filter((p) => p.status === 'PRESENT').length;
  const lateCount = currentDay.periods.filter((p) => p.status === 'LATE').length;
  const odCount = currentDay.periods.filter((p) => p.status === 'ON_DUTY').length;
  const absentCount = currentDay.periods.filter((p) => p.status === 'ABSENT').length;
  const dailyEffectiveAttendance = Math.round(((presentCount + lateCount + odCount) / 6) * 100);

  // Subject-wise cumulative breakdown table
  const subjectBreakdown = [
    {
      code: 'AIML301',
      name: 'Deep Learning & Neural Architectures',
      held: 36,
      attended: 33,
      od: 2,
      percentage: 97.2,
      status: 'SAFE',
    },
    {
      code: 'AIML302',
      name: 'Distributed Cloud Computing Systems',
      held: 34,
      attended: 30,
      od: 1,
      percentage: 91.2,
      status: 'SAFE',
    },
    {
      code: 'AIML303',
      name: 'Computer Vision & Scene Understanding',
      held: 32,
      attended: 28,
      od: 2,
      percentage: 93.8,
      status: 'SAFE',
    },
    {
      code: 'MATH202',
      name: 'Mathematical Optimization & Linear Algebra',
      held: 38,
      attended: 31,
      od: 0,
      percentage: 81.6,
      status: 'WATCH',
    },
    {
      code: 'AIML305',
      name: 'Reinforcement Learning & Robotics Lab',
      held: 30,
      attended: 28,
      od: 1,
      percentage: 96.7,
      status: 'SAFE',
    },
    {
      code: 'PRJ310',
      name: 'Capstone Project & Industry Mentorship',
      held: 24,
      attended: 20,
      od: 3,
      percentage: 95.8,
      status: 'SAFE',
    },
  ];

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleOdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOdSubmitted(true);
    setTimeout(() => {
      setShowOdModal(false);
      setOdSubmitted(false);
    }, 1800);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold uppercase tracking-wider rounded">
              ATTENDANCE MONITORING & AUDIT
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              ACADEMIC REGULATION 2026
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            My Attendance
          </h1>
          <p className="text-sm text-slate-500">
            Real-time period-by-period biometric logs, semester cumulative standing, and examination eligibility.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOdModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 shadow-xs transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem] text-slate-500">assignment_turned_in</span>
            <span>Apply for OD / Leave</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0b1727] text-white rounded-md text-sm font-medium hover:bg-[#13243c] shadow-xs transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">download</span>
            <span>Download Log (PDF)</span>
          </button>
        </div>
      </div>

      {/* Download Alert Notification */}
      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center justify-between shadow-xs transition-all">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[1.3rem] text-emerald-600">check_circle</span>
            <div className="text-sm">
              <strong className="font-semibold">Attendance Log Generated:</strong> 6-Period verified audit report for Semester {classData?.currentSemester || 3} has been compiled and saved.
            </div>
          </div>
          <button onClick={() => setDownloadSuccess(false)} type="button">
            <span className="material-symbols-outlined text-[1.1rem]">close</span>
          </button>
        </div>
      )}

      {/* ─── 4 Summary Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cumulative Attendance */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              CUMULATIVE ATTENDANCE
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
              <span className="material-symbols-outlined text-[1.25rem]">fact_check</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              92.8%
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-emerald-700">Eligible for End-Sem Exam</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Minimum mandatory threshold: 75.0%
            </div>
          </div>
        </div>

        {/* Card 2: Today's 6 Periods */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TODAY'S ATTENDANCE
            </span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-md">
              <span className="material-symbols-outlined text-[1.25rem]">today</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              6 / 6
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-2">
              {presentCount} Present · {lateCount} Late · {odCount} On Duty
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {dailyEffectiveAttendance}% effective attendance score today
            </div>
          </div>
        </div>

        {/* Card 3: Total Hours / Periods */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              HOURS CONDUCTED
            </span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
              <span className="material-symbols-outlined text-[1.25rem]">schedule</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              194 / 210
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-2">
              Periods Attended in Term {classData?.currentSemester || 3}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Excused: 9 periods · Medical/OD: 7 periods
            </div>
          </div>
        </div>

        {/* Card 4: Shortage Safety Buffer */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              SAFE ABSENCE MARGIN
            </span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-md">
              <span className="material-symbols-outlined text-[1.25rem]">security</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600 tracking-tight font-mono">
              +36 Periods
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-2">
              Permitted leaves buffer available
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Before dropping to 75% critical line
            </div>
          </div>
        </div>
      </div>

      {/* ─── Daily 6-Period Schedule Section ─── */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        {/* Top Control Bar with Day Selector & Status Filter */}
        <div className="p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <h2 className="text-lg font-bold text-slate-900">
                Daily Timetable & Period Verification (6 Periods)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified biometric and smart faculty classroom attendance recorded per instructional period.
            </p>
          </div>

          {/* Day Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {weekAttendance.map((d, idx) => (
              <button
                key={d.dayName}
                onClick={() => setSelectedDayIndex(idx)}
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  selectedDayIndex === idx
                    ? 'bg-[#0b1727] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{d.dayName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium">Filter by status:</span>
            {(['ALL', 'PRESENT', 'LATE', 'ON_DUTY', 'ABSENT'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                type="button"
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{filteredPeriods.length}</strong> of 6 periods for <span className="font-semibold text-slate-700">{currentDay.dateStr}</span>
          </div>
        </div>

        {/* 6 Periods Detailed Timeline Cards */}
        <div className="p-6 divide-y divide-slate-100 flex flex-col">
          {filteredPeriods.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <span className="material-symbols-outlined text-[2.5rem] mb-2">event_busy</span>
              <p className="text-sm font-medium">No periods found matching filter "{statusFilter}".</p>
            </div>
          ) : (
            filteredPeriods.map((p, index) => {
              // Status Badge Styling
              const getStatusBadge = (st: PeriodRecord['status']) => {
                switch (st) {
                  case 'PRESENT':
                    return (
                      <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                        <span className="material-symbols-outlined text-[1rem] text-emerald-600">check_circle</span>
                        <span>PRESENT</span>
                      </span>
                    );
                  case 'LATE':
                    return (
                      <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                        <span className="material-symbols-outlined text-[1rem] text-amber-600">schedule</span>
                        <span>LATE ENTRY</span>
                      </span>
                    );
                  case 'ON_DUTY':
                    return (
                      <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                        <span className="material-symbols-outlined text-[1rem] text-blue-600">assignment_turned_in</span>
                        <span>ON DUTY (OD)</span>
                      </span>
                    );
                  case 'ABSENT':
                    return (
                      <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                        <span className="material-symbols-outlined text-[1rem] text-rose-600">cancel</span>
                        <span>ABSENT</span>
                      </span>
                    );
                }
              };

              return (
                <div
                  key={p.period}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 px-3 rounded-lg transition-colors"
                >
                  {/* Left: Period Badge & Time */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-[200px]">
                    <div className="w-11 h-11 bg-[#0b1727] text-white rounded-lg flex flex-col items-center justify-center font-mono shrink-0 shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">P</span>
                      <span className="text-base font-extrabold leading-none">{p.period}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        {p.timeSlot}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Period {p.period} of 6
                      </span>
                    </div>
                  </div>

                  {/* Center: Course & Faculty Details */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded">
                        {p.courseCode}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 hover:text-blue-700 transition-colors cursor-pointer">
                        {p.courseName}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[0.95rem] text-slate-400">person</span>
                        <span>{p.facultyName}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[0.95rem] text-slate-400">location_on</span>
                        <span>{p.venue}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 italic">
                        Topic: "{p.topic}"
                      </span>
                    </div>
                  </div>

                  {/* Right: Verification & Status Badge */}
                  <div className="flex items-center justify-between md:justify-end gap-4 min-w-[220px]">
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        {p.markedAt}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Via {p.verificationMethod}
                      </span>
                    </div>

                    <div>{getStatusBadge(p.status)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Break Note Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[1.1rem] text-slate-400">info</span>
            <span>
              <strong>Schedule Intervals:</strong> Recess Break (10:45 AM - 11:00 AM) · Lunch Break (12:45 PM - 01:45 PM).
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Biometric Gate ID: BIO-AURA-04
          </span>
        </div>
      </div>

      {/* ─── Subject-Wise Cumulative Attendance Table ─── */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Subject-wise Cumulative Standing
            </h3>
            <p className="text-xs text-slate-500">
              Course-level breakdown for {classData?.name || 'Year II (Sec A)'} · Required: Minimum 75% per course
            </p>
          </div>
          <button
            onClick={() => navigate('/student/subjects')}
            className="text-xs font-semibold text-slate-700 hover:text-black inline-flex items-center gap-1 self-start sm:self-auto"
            type="button"
          >
            <span>View Full Syllabus</span>
            <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-center">Periods Held</th>
                <th className="py-3 px-4 text-center">Attended</th>
                <th className="py-3 px-4 text-center">OD / Medical</th>
                <th className="py-3 px-4">Attendance Progress</th>
                <th className="py-3 px-4 text-right">Percentage</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectBreakdown.map((sub) => (
                <tr key={sub.code} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono font-bold rounded text-[11px]">
                        {sub.code}
                      </span>
                      <span className="font-semibold text-slate-900 text-xs">
                        {sub.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-medium text-slate-600">
                    {sub.held}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-700">
                    {sub.attended}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-blue-600">
                    {sub.od}
                  </td>
                  <td className="py-3 px-4 min-w-[160px]">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          sub.percentage >= 90
                            ? 'bg-emerald-600'
                            : sub.percentage >= 75
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${sub.percentage}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                    {sub.percentage}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    {sub.percentage >= 75 ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded text-[11px] inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Eligible
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-semibold rounded text-[11px] inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Shortage
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Policy Guide & Regulatory Disclaimer ─── */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row items-start gap-4 text-xs text-slate-600">
        <span className="material-symbols-outlined text-[1.8rem] text-slate-500 shrink-0">
          gavel
        </span>
        <div className="flex flex-col gap-1">
          <span className="font-bold text-slate-800">
            Institutional Attendance Guidelines (Anna University / Autonomous Regulations)
          </span>
          <p className="leading-relaxed">
            Students are required to secure a minimum of <strong>75% attendance</strong> in all courses to be permitted to write Semester End Examinations. Condonation up to 10% (between 65% and 74%) may be granted by the Academic Council strictly on valid medical grounds or official institution representation (On Duty). Below 65% will result in course re-registration.
          </p>
        </div>
      </div>

      {/* ─── On Duty (OD) Application Modal ─── */}
      {showOdModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 flex flex-col gap-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded">
                  <span className="material-symbols-outlined text-[1.25rem]">assignment_turned_in</span>
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Submit On-Duty (OD) / Leave
                </h3>
              </div>
              <button
                onClick={() => setShowOdModal(false)}
                className="text-slate-400 hover:text-slate-700"
                type="button"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            {odSubmitted ? (
              <div className="py-6 text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[2.5rem] text-emerald-600 animate-bounce">
                  check_circle
                </span>
                <h4 className="text-base font-bold text-slate-900">Request Forwarded!</h4>
                <p className="text-xs text-slate-500">
                  Your request has been routed to Class Incharge for approval and Dean endorsement.
                </p>
              </div>
            ) : (
              <form onSubmit={handleOdSubmit} className="flex flex-col gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Activity / Event Category
                  </label>
                  <select
                    value={odReason}
                    onChange={(e) => setOdReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-slate-400"
                  >
                    <option value="Hackathon">Technical Competition / Hackathon</option>
                    <option value="Paper">Conference / Paper Presentation</option>
                    <option value="Sports">Zonal / State Sports Representation</option>
                    <option value="Medical">Medical Leave (Doctor Endorsement)</option>
                    <option value="Club">Institutional Club Organizing Committee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Target Periods
                  </label>
                  <select
                    value={odPeriod}
                    onChange={(e) => setOdPeriod(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-slate-400"
                  >
                    <option value="All Day">Full Day (All 6 Periods)</option>
                    <option value="Morning">Morning Session (Periods 1 - 4)</option>
                    <option value="Afternoon">Afternoon Session (Periods 5 - 6)</option>
                    <option value="P6">Period 6 Only (Project Mentorship)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Remarks / Evidence URL
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide acceptance letter link, invitation email reference, or certificate..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                    defaultValue="Representing College at National Smart India Hackathon Grand Finale."
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowOdModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-md text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0b1727] text-white rounded-md font-medium hover:bg-[#13243c]"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
