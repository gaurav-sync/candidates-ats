'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';

function JobCard({ job, isDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: job._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow touch-manipulation"
    >
      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{job.company}</h3>
      <p className="text-xs sm:text-sm text-gray-600 mt-1">{job.role}</p>
      {job.location && (
        <p className="text-xs text-gray-500 mt-2">📍 {job.location}</p>
      )}
      <Link
        href={`/jobs/${job._id}`}
        className="text-xs text-indigo-600 hover:underline mt-2 inline-block"
        onClick={(e) => e.stopPropagation()}
      >
        View Details →
      </Link>
    </div>
  );
}

function StageColumn({ stage, jobs }) {
  const { setNodeRef } = useSortable({ id: stage._id });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100 rounded-xl p-3 sm:p-4 min-w-[280px] sm:min-w-[300px] max-w-[280px] sm:max-w-[300px]"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: stage.color }}
          />
          <h2 className="font-bold text-gray-900 text-sm sm:text-base">{stage.name}</h2>
        </div>
        <span className="bg-gray-200 text-gray-700 text-xs sm:text-sm px-2 py-1 rounded-full">
          {jobs.length}
        </span>
      </div>
      <SortableContext
        items={jobs.map((job) => job._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 sm:space-y-3 min-h-[200px]">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function PipelinePage() {
  const [stages, setStages] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setJobs([]);
      setStages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const jobId = active.id;
    const overId = over.id;

    // Check if dropped on a stage
    const targetStage = stages.find((stage) => stage._id === overId);
    if (targetStage) {
      const job = jobs.find((j) => j._id === jobId);
      if (job && job.stageId._id !== targetStage._id) {
        // Update stage
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('/api/jobs/update-stage', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ jobId, stageId: targetStage._id }),
          });

          if (res.ok) {
            const updatedJob = await res.json();
            setJobs(jobs.map((j) => (j._id === jobId ? updatedJob : j)));
          }
        } catch (error) {
          console.error('Failed to update stage:', error);
        }
      }
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeJob = jobs.find((j) => j._id === active.id);
    const overStage = stages.find((s) => s._id === over.id);

    if (activeJob && overStage && activeJob.stageId._id !== overStage._id) {
      // Optimistically update UI
      setJobs(
        jobs.map((job) =>
          job._id === active.id
            ? { ...job, stageId: overStage }
            : job
        )
      );
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

  const activeJob = activeId ? jobs.find((job) => job._id === activeId) : null;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto">
        <div className="mb-6 sm:mb-8 mt-16 lg:mt-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Drag and drop jobs between stages to update their status
          </p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="flex gap-3 sm:gap-4 pb-8 min-w-max">
            <SortableContext items={stages.map((s) => s._id)}>
              {stages.map((stage) => {
                const stageJobs = jobs.filter(
                  (job) => job.stageId._id === stage._id
                );
                return (
                  <StageColumn key={stage._id} stage={stage} jobs={stageJobs} />
                );
              })}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeJob ? (
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg border-2 border-indigo-500 w-[280px] sm:w-[300px]">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                  {activeJob.company}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{activeJob.role}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
