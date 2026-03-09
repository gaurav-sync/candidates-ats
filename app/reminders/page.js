'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { localDateTimeToISO, isoToLocalDateTime } from '@/utils/dateTime';

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    jobId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [remindersRes, jobsRes] = await Promise.all([
        fetch('/api/reminders', { headers }),
        fetch('/api/jobs', { headers }),
      ]);

      const remindersData = await remindersRes.json();
      const jobsData = await jobsRes.json();

      setReminders(remindersData);
      setJobs(jobsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Convert local datetime to ISO for storage
      const reminderData = {
        ...formData,
        dateTime: localDateTimeToISO(formData.dateTime),
      };
      
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reminderData),
      });

      if (res.ok) {
        const newReminder = await res.json();
        setReminders([newReminder, ...reminders]);
        setShowModal(false);
        setFormData({
          title: '',
          description: '',
          dateTime: '',
          jobId: '',
        });
      }
    } catch (error) {
      console.error('Failed to create reminder:', error);
    }
  };

  const handleDelete = async (reminderId) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setReminders(reminders.filter((r) => r._id !== reminderId));
      }
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const handleToggleComplete = async (reminder) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/reminders/${reminder._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !reminder.completed }),
      });

      if (res.ok) {
        const updated = await res.json();
        setReminders(
          reminders.map((r) => (r._id === reminder._id ? updated : r))
        );
      }
    } catch (error) {
      console.error('Failed to update reminder:', error);
    }
  };

  const getTimeLabel = (dateTime) => {
    const date = new Date(dateTime);
    if (isPast(date)) return '⚠️ Overdue';
    if (isToday(date)) return '🔥 Today';
    if (isTomorrow(date)) return '📅 Tomorrow';
    return '📆 Upcoming';
  };

  const upcomingReminders = reminders.filter((r) => !r.completed);
  const completedReminders = reminders.filter((r) => r.completed);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Add Reminder
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">
                Upcoming ({upcomingReminders.length})
              </h2>
              {upcomingReminders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No upcoming reminders
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingReminders
                    .sort(
                      (a, b) =>
                        new Date(a.dateTime) - new Date(b.dateTime)
                    )
                    .map((reminder) => (
                      <div
                        key={reminder._id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={reminder.completed}
                          onChange={() => handleToggleComplete(reminder)}
                          className="mt-1 w-5 h-5 text-indigo-600 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {reminder.title}
                              </p>
                              {reminder.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {reminder.description}
                                </p>
                              )}
                              {reminder.jobId && (
                                <p className="text-sm text-indigo-600 mt-2">
                                  📋 {reminder.jobId.company} -{' '}
                                  {reminder.jobId.role}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDelete(reminder._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="text-gray-600">
                              {getTimeLabel(reminder.dateTime)}
                            </span>
                            <span className="text-gray-500">
                              {format(
                                new Date(reminder.dateTime),
                                'MMM d, yyyy h:mm a'
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {completedReminders.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">
                  Completed ({completedReminders.length})
                </h2>
                <div className="space-y-3">
                  {completedReminders.map((reminder) => (
                    <div
                      key={reminder._id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg opacity-60"
                    >
                      <input
                        type="checkbox"
                        checked={reminder.completed}
                        onChange={() => handleToggleComplete(reminder)}
                        className="mt-1 w-5 h-5 text-indigo-600 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 line-through">
                          {reminder.title}
                        </p>
                        {reminder.jobId && (
                          <p className="text-sm text-gray-600 mt-1">
                            {reminder.jobId.company} - {reminder.jobId.role}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(reminder._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Add Reminder</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Follow up with recruiter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Additional details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.dateTime}
                  onChange={(e) =>
                    setFormData({ ...formData, dateTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Job (Optional)
                </label>
                <select
                  value={formData.jobId}
                  onChange={(e) =>
                    setFormData({ ...formData, jobId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">None</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.company} - {job.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                  Add Reminder
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
