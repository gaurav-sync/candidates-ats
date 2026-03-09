'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { format } from 'date-fns';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [stages, setStages] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    title: '',
    description: '',
    dateTime: '',
  });
  const [timelineForm, setTimelineForm] = useState({
    type: 'note',
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [jobRes, stagesRes, remindersRes] = await Promise.all([
        fetch(`/api/jobs/${params.id}`, { headers }),
        fetch('/api/stages', { headers }),
        fetch(`/api/reminders?jobId=${params.id}`, { headers }),
      ]);

      const jobData = await jobRes.json();
      const stagesData = await stagesRes.json();
      const remindersData = await remindersRes.json();

      setJob(jobData);
      setStages(stagesData);
      setReminders(remindersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (newStageId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/jobs/update-stage', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId: params.id, stageId: newStageId }),
      });

      if (res.ok) {
        const updatedJob = await res.json();
        setJob(updatedJob);
      }
    } catch (error) {
      console.error('Failed to update stage:', error);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...reminderForm, jobId: params.id }),
      });

      if (res.ok) {
        const newReminder = await res.json();
        setReminders([...reminders, newReminder]);
        setShowReminderModal(false);
        setReminderForm({ title: '', description: '', dateTime: '' });
      }
    } catch (error) {
      console.error('Failed to add reminder:', error);
    }
  };

  const handleAddTimeline = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updatedJob = {
        ...job,
        timelineUpdates: [...job.timelineUpdates, timelineForm],
      };

      const res = await fetch(`/api/jobs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedJob),
      });

      if (res.ok) {
        const updated = await res.json();
        setJob(updated);
        setShowTimelineModal(false);
        setTimelineForm({ type: 'note', title: '', description: '' });
      }
    } catch (error) {
      console.error('Failed to add timeline update:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">Loading...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">Job not found</div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-800 mb-6"
          >
            ← Back
          </button>

          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{job.company}</h1>
                <p className="text-xl text-gray-600 mt-1">{job.role}</p>
              </div>
              <select
                value={job.stageId._id}
                onChange={(e) => handleStageChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {stages.map((stage) => (
                  <option key={stage._id} value={stage._id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{job.location || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Salary Expectation</p>
                <p className="font-medium">
                  {job.salaryExpectation || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact Person</p>
                <p className="font-medium">{job.contactName || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact Email</p>
                <p className="font-medium">{job.contactEmail || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Applied Date</p>
                <p className="font-medium">
                  {format(new Date(job.appliedDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Job Link</p>
                {job.jobLink ? (
                  <a
                    href={job.jobLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    View Posting
                  </a>
                ) : (
                  <p className="font-medium">Not specified</p>
                )}
              </div>
            </div>

            {job.notes && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Notes</p>
                <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">
                  {job.notes}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Timeline</h2>
                <button
                  onClick={() => setShowTimelineModal(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  + Add Update
                </button>
              </div>
              <div className="space-y-4">
                {job.timelineUpdates.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No updates yet</p>
                ) : (
                  job.timelineUpdates
                    .slice()
                    .reverse()
                    .map((update, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="text-2xl">
                          {update.type === 'call' && '📞'}
                          {update.type === 'email' && '📧'}
                          {update.type === 'interview' && '🎤'}
                          {update.type === 'assignment' && '📝'}
                          {update.type === 'note' && '📌'}
                          {update.type === 'stage_change' && '🔄'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{update.title}</p>
                          {update.description && (
                            <p className="text-sm text-gray-600">
                              {update.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(update.createdAt), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Reminders</h2>
                <button
                  onClick={() => setShowReminderModal(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  + Add Reminder
                </button>
              </div>
              <div className="space-y-3">
                {reminders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No reminders set</p>
                ) : (
                  reminders.map((reminder) => (
                    <div
                      key={reminder._id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <p className="font-medium">{reminder.title}</p>
                      {reminder.description && (
                        <p className="text-sm text-gray-600">
                          {reminder.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(reminder.dateTime), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Add Reminder</h2>
            <form onSubmit={handleAddReminder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={reminderForm.title}
                  onChange={(e) =>
                    setReminderForm({ ...reminderForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={reminderForm.description}
                  onChange={(e) =>
                    setReminderForm({
                      ...reminderForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={reminderForm.dateTime}
                  onChange={(e) =>
                    setReminderForm({ ...reminderForm, dateTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTimelineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Add Timeline Update</h2>
            <form onSubmit={handleAddTimeline} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={timelineForm.type}
                  onChange={(e) =>
                    setTimelineForm({ ...timelineForm, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="note">Note</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="interview">Interview</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={timelineForm.title}
                  onChange={(e) =>
                    setTimelineForm({ ...timelineForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={timelineForm.description}
                  onChange={(e) =>
                    setTimelineForm({
                      ...timelineForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowTimelineModal(false)}
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
