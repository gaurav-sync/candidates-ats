'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';

export default function CalendarPage() {
  const [reminders, setReminders] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reminders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getRemindersForDate = (date) => {
    return reminders.filter((reminder) =>
      isSameDay(new Date(reminder.dateTime), date)
    );
  };

  const selectedDateReminders = getRemindersForDate(selectedDate);

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
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Calendar</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div
                    key={day}
                    className="text-center font-semibold text-gray-600 py-2"
                  >
                    {day}
                  </div>
                ))}

                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {daysInMonth.map((day) => {
                  const dayReminders = getRemindersForDate(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentDay = isToday(day);

                  return (
                    <button
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        min-h-[80px] p-2 rounded-lg border transition-colors
                        ${
                          isSelected
                            ? 'bg-indigo-100 border-indigo-500'
                            : 'border-gray-200 hover:bg-gray-50'
                        }
                        ${!isSameMonth(day, currentMonth) && 'opacity-50'}
                      `}
                    >
                      <div
                        className={`
                        text-sm font-semibold mb-1
                        ${isCurrentDay ? 'text-indigo-600' : 'text-gray-900'}
                      `}
                      >
                        {format(day, 'd')}
                      </div>
                      {dayReminders.length > 0 && (
                        <div className="space-y-1">
                          {dayReminders.slice(0, 2).map((reminder) => (
                            <div
                              key={reminder._id}
                              className="text-xs bg-indigo-500 text-white px-1 py-0.5 rounded truncate"
                            >
                              {reminder.title}
                            </div>
                          ))}
                          {dayReminders.length > 2 && (
                            <div className="text-xs text-gray-600">
                              +{dayReminders.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h2>

              {selectedDateReminders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No reminders for this day
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDateReminders.map((reminder) => (
                    <div
                      key={reminder._id}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl">🔔</span>
                        <div className="flex-1">
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
                              {reminder.jobId.company} - {reminder.jobId.role}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {format(new Date(reminder.dateTime), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
