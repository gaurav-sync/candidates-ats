'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalJobs: 0,
    stageBreakdown: [],
    upcomingReminders: [],
    recentJobs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found, redirecting to login');
        router.push('/login');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };

      const [jobsRes, stagesRes, remindersRes] = await Promise.all([
        fetch('/api/jobs', { headers }),
        fetch('/api/stages', { headers }),
        fetch('/api/reminders', { headers }),
      ]);

      // Check for authentication errors
      if (!jobsRes.ok || !stagesRes.ok || !remindersRes.ok) {
        console.error('API request failed:', {
          jobs: jobsRes.status,
          stages: stagesRes.status,
          reminders: remindersRes.status,
        });
        
        if (jobsRes.status === 401 || stagesRes.status === 401 || remindersRes.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
      }

      const jobs = await jobsRes.json();
      const stages = await stagesRes.json();
      const reminders = await remindersRes.json();

      console.log('Dashboard data:', { jobs, stages, reminders });

      // Ensure we have arrays, not error objects
      const jobsArray = Array.isArray(jobs) ? jobs : [];
      const stagesArray = Array.isArray(stages) ? stages : [];
      const remindersArray = Array.isArray(reminders) ? reminders : [];

      if (!Array.isArray(stages)) {
        console.error('Stages is not an array:', stages);
      }

      const stageBreakdown = stagesArray.map((stage) => ({
        ...stage,
        count: jobsArray.filter((job) => job.stageId?._id === stage._id).length,
      }));

      const upcomingReminders = remindersArray
        .filter((r) => !r.completed && new Date(r.dateTime) > new Date())
        .slice(0, 5);

      setStats({
        totalJobs: jobsArray.length,
        stageBreakdown,
        upcomingReminders,
        recentJobs: jobsArray.slice(0, 5),
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set empty state on error
      setStats({
        totalJobs: 0,
        stageBreakdown: [],
        upcomingReminders: [],
        recentJobs: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const getReminderTimeLabel = (dateTime) => {
    const date = new Date(dateTime);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return 'Overdue';
    return format(date, 'MMM d');
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full lg:ml-0">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 mt-16 lg:mt-0">Dashboard</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">Total Applications</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalJobs}
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl">💼</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">Active Stages</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                    {stats.stageBreakdown.filter((s) => s.count > 0).length}
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl">🔄</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">Upcoming Reminders</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                    {stats.upcomingReminders.length}
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl">🔔</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">Success Rate</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalJobs > 0
                      ? Math.round(
                          (stats.stageBreakdown.find((s) => s.name === 'Offer')
                            ?.count || 0) /
                            stats.totalJobs *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl">📈</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Pipeline Overview
              </h2>
              <div className="space-y-3">
                {stats.stageBreakdown.map((stage) => (
                  <div key={stage._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="text-sm sm:text-base text-gray-700">{stage.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {stage.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Upcoming Reminders
              </h2>
              {stats.upcomingReminders.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
                  No upcoming reminders
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.upcomingReminders.map((reminder) => (
                    <div
                      key={reminder._id}
                      className="flex items-start gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="text-xl sm:text-2xl">🔔</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {reminder.title}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {reminder.jobId?.company} - {reminder.jobId?.role}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {getReminderTimeLabel(reminder.dateTime)} at{' '}
                          {format(new Date(reminder.dateTime), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:col-span-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Recent Applications
              </h2>
              {stats.recentJobs.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
                  No applications yet
                </p>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-gray-600 font-medium text-xs sm:text-sm">
                            Company
                          </th>
                          <th className="text-left py-3 px-4 text-gray-600 font-medium text-xs sm:text-sm">
                            Role
                          </th>
                          <th className="text-left py-3 px-4 text-gray-600 font-medium text-xs sm:text-sm hidden sm:table-cell">
                            Stage
                          </th>
                          <th className="text-left py-3 px-4 text-gray-600 font-medium text-xs sm:text-sm hidden md:table-cell">
                            Applied
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentJobs.map((job) => (
                          <tr key={job._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-sm">{job.company}</td>
                            <td className="py-3 px-4 text-sm">{job.role}</td>
                            <td className="py-3 px-4 hidden sm:table-cell">
                              <span
                                className="px-2 sm:px-3 py-1 rounded-full text-xs text-white whitespace-nowrap"
                                style={{ backgroundColor: job.stageId.color }}
                              >
                                {job.stageId.name}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 text-xs sm:text-sm hidden md:table-cell">
                              {format(new Date(job.appliedDate), 'MMM d, yyyy')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
