'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

export default function DashboardPage() {
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
      const headers = { Authorization: `Bearer ${token}` };

      const [jobsRes, stagesRes, remindersRes] = await Promise.all([
        fetch('/api/jobs', { headers }),
        fetch('/api/stages', { headers }),
        fetch('/api/reminders', { headers }),
      ]);

      const jobs = await jobsRes.json();
      const stages = await stagesRes.json();
      const reminders = await remindersRes.json();

      const stageBreakdown = stages.map((stage) => ({
        ...stage,
        count: jobs.filter((job) => job.stageId._id === stage._id).length,
      }));

      const upcomingReminders = reminders
        .filter((r) => !r.completed && new Date(r.dateTime) > new Date())
        .slice(0, 5);

      setStats({
        totalJobs: jobs.length,
        stageBreakdown,
        upcomingReminders,
        recentJobs: jobs.slice(0, 5),
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalJobs}
                  </p>
                </div>
                <div className="text-4xl">💼</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Stages</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.stageBreakdown.filter((s) => s.count > 0).length}
                  </p>
                </div>
                <div className="text-4xl">🔄</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Upcoming Reminders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.upcomingReminders.length}
                  </p>
                </div>
                <div className="text-4xl">🔔</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Success Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
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
                <div className="text-4xl">📈</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Pipeline Overview
              </h2>
              <div className="space-y-3">
                {stats.stageBreakdown.map((stage) => (
                  <div key={stage._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="text-gray-700">{stage.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {stage.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Upcoming Reminders
              </h2>
              {stats.upcomingReminders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No upcoming reminders
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.upcomingReminders.map((reminder) => (
                    <div
                      key={reminder._id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="text-2xl">🔔</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {reminder.title}
                        </p>
                        <p className="text-sm text-gray-600">
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

            <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Recent Applications
              </h2>
              {stats.recentJobs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No applications yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">
                          Company
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">
                          Role
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">
                          Stage
                        </th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">
                          Applied
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentJobs.map((job) => (
                        <tr key={job._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{job.company}</td>
                          <td className="py-3 px-4">{job.role}</td>
                          <td className="py-3 px-4">
                            <span
                              className="px-3 py-1 rounded-full text-sm text-white"
                              style={{ backgroundColor: job.stageId.color }}
                            >
                              {job.stageId.name}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {format(new Date(job.appliedDate), 'MMM d, yyyy')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
