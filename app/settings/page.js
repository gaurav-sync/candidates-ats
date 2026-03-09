'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function SettingsPage() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#6366f1',
  });

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/stages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch stages:', error);
      setStages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      if (editingStage) {
        const res = await fetch(`/api/stages/${editingStage._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const updated = await res.json();
          setStages(stages.map((s) => (s._id === updated._id ? updated : s)));
        }
      } else {
        const res = await fetch('/api/stages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const newStage = await res.json();
          setStages([...stages, newStage]);
        }
      }

      setShowModal(false);
      setEditingStage(null);
      setFormData({ name: '', color: '#6366f1' });
    } catch (error) {
      console.error('Failed to save stage:', error);
    }
  };

  const handleEdit = (stage) => {
    setEditingStage(stage);
    setFormData({ name: stage.name, color: stage.color });
    setShowModal(true);
  };

  const handleDelete = async (stageId) => {
    if (!confirm('Are you sure? Jobs in this stage cannot be deleted.')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/stages/${stageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setStages(stages.filter((s) => s._id !== stageId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete stage');
      }
    } catch (error) {
      console.error('Failed to delete stage:', error);
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

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">Pipeline Stages</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Customize your job application stages
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingStage(null);
                  setFormData({ name: '', color: '#6366f1' });
                  setShowModal(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                + Add Stage
              </button>
            </div>

            <div className="space-y-3">
              {stages.map((stage, index) => (
                <div
                  key={stage._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 font-mono">{index + 1}</span>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="font-medium">{stage.name}</span>
                    {stage.isDefault && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(stage)}
                      className="text-indigo-600 hover:text-indigo-800 px-3 py-1"
                    >
                      Edit
                    </button>
                    {!stage.isDefault && (
                      <button
                        onClick={() => handleDelete(stage._id)}
                        className="text-red-600 hover:text-red-800 px-3 py-1"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">About</h2>
            <div className="space-y-2 text-gray-600">
              <p>Job Application Tracker v1.0</p>
              <p>Track your job applications and manage your interview pipeline.</p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingStage ? 'Edit Stage' : 'Add Stage'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stage Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Phone Screen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="#6366f1"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                  {editingStage ? 'Update' : 'Add'} Stage
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingStage(null);
                    setFormData({ name: '', color: '#6366f1' });
                  }}
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
