'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { format } from 'date-fns';
import Link from 'next/link';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    jobLink: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
    salaryExpectation: '',
    location: '',
    stageId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [jobsRes, stagesRes] = await Promise.all([
        fetch('/api/jobs', { headers }),
        fetch('/api/stages', { headers }),
      ]);

      const jobsData = await jobsRes.json();
      const stagesData = await stagesRes.json();

      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setStages(Array.isArray(stagesData) ? stagesData : []);
      if (stagesData.length > 0 && Array.isArray(stagesData)) {
        setFormData((prev) => ({ ...prev, stageId: stagesData[0]._id }));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setJobs([]);
      setStages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newJob = await res.json();
        setJobs([newJob, ...jobs]);
        setShowModal(false);
        setFormData({
          company: '',
          role: '',
          jobLink: '',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          notes: '',
          salaryExpectation: '',
          location: '',
          stageId: stages[0]?._id || '',
        });
      }
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setJobs(jobs.filter((job) => job._id !== jobId));
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = !filterStage || job.stageId._id === filterStage;
    return matchesSearch && matchesStage;
  });

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
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 mt-16 lg:mt-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Job Applications</h1>
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto bg-indigo-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
            >
              + Add Job
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Search by company or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
              />
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="">All Stages</option>
                {stages.map((stage) => (
                  <option key={stage._id} value={stage._id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm sm:text-base">No jobs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-gray-600 font-medium text-xs sm:text-sm">
                        Company
                      </th>
                      <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-gray-600 font-medium text-xs sm:text-sm">
                        Role
                      </th>
                      <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-gray-600 font-medium text-xs sm:text-sm hidden md:table-cell">
                        Location
                      </th>
                      <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-gray-600 font-medium text-xs sm:text-sm">
                        Stage
                      </th>
                      <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-gray-600 font-medium text-xs sm:text-sm hidden sm:table-cell">
                        Applied
                      </th>
                      <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-gray-600 font-medium text-xs sm:text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job) => (
                      <tr key={job._id} className="border-t hover:bg-gray-50">
                        <td className="py-3 sm:py-4 px-4 sm:px-6 font-medium text-sm">{job.company}</td>
                        <td className="py-3 sm:py-4 px-4 sm:px-6 text-sm">{job.role}</td>
                        <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-600 text-sm hidden md:table-cell">
                          {job.location || '-'}
                        </td>
                        <td className="py-3 sm:py-4 px-4 sm:px-6">
                          <span
                            className="px-2 sm:px-3 py-1 rounded-full text-xs text-white whitespace-nowrap"
                            style={{ backgroundColor: job.stageId.color }}
                          >
                            {job.stageId.name}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-600 text-xs sm:text-sm hidden sm:table-cell">
                          {format(new Date(job.appliedDate), 'MMM d, yyyy')}
                        </td>
                        <td className="py-3 sm:py-4 px-4 sm:px-6">
                          <div className="flex gap-2 text-xs sm:text-sm">
                            <Link
                              href={`/jobs/${job._id}`}
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDelete(job._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 my-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Add New Job</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Link
                </label>
                <input
                  type="url"
                  value={formData.jobLink}
                  onChange={(e) =>
                    setFormData({ ...formData, jobLink: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) =>
                      setFormData({ ...formData, contactName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary Expectation
                  </label>
                  <input
                    type="text"
                    value={formData.salaryExpectation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salaryExpectation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stage *
                </label>
                <select
                  required
                  value={formData.stageId}
                  onChange={(e) =>
                    setFormData({ ...formData, stageId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {stages.map((stage) => (
                    <option key={stage._id} value={stage._id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                  Add Job
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
