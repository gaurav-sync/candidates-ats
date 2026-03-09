import { configureStore, createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    loading: false,
    error: null,
  },
  reducers: {
    setJobs: (state, action) => {
      state.jobs = action.payload;
      state.loading = false;
    },
    addJob: (state, action) => {
      state.jobs.push(action.payload);
    },
    updateJob: (state, action) => {
      const index = state.jobs.findIndex(job => job._id === action.payload._id);
      if (index !== -1) {
        state.jobs[index] = action.payload;
      }
    },
    deleteJob: (state, action) => {
      state.jobs = state.jobs.filter(job => job._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

const stagesSlice = createSlice({
  name: 'stages',
  initialState: {
    stages: [],
    loading: false,
  },
  reducers: {
    setStages: (state, action) => {
      state.stages = action.payload;
      state.loading = false;
    },
    addStage: (state, action) => {
      state.stages.push(action.payload);
    },
    updateStage: (state, action) => {
      const index = state.stages.findIndex(stage => stage._id === action.payload._id);
      if (index !== -1) {
        state.stages[index] = action.payload;
      }
    },
    deleteStage: (state, action) => {
      state.stages = state.stages.filter(stage => stage._id !== action.payload);
    },
    reorderStages: (state, action) => {
      state.stages = action.payload;
    },
  },
});

const remindersSlice = createSlice({
  name: 'reminders',
  initialState: {
    reminders: [],
    loading: false,
  },
  reducers: {
    setReminders: (state, action) => {
      state.reminders = action.payload;
      state.loading = false;
    },
    addReminder: (state, action) => {
      state.reminders.push(action.payload);
    },
    deleteReminder: (state, action) => {
      state.reminders = state.reminders.filter(reminder => reminder._id !== action.payload);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const { setJobs, addJob, updateJob, deleteJob, setLoading, setError } = jobsSlice.actions;
export const { setStages, addStage, updateStage, deleteStage, reorderStages } = stagesSlice.actions;
export const { setReminders, addReminder, deleteReminder } = remindersSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    jobs: jobsSlice.reducer,
    stages: stagesSlice.reducer,
    reminders: remindersSlice.reducer,
  },
});
