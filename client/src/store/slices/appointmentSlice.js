import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAppointments = createAsyncThunk('appointments/fetchAppointments', async (params, { rejectWithValue }) => {
  try {
    const res = await api.getAppointments(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const bookNewAppointment = createAsyncThunk('appointments/bookNew', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.bookAppointment(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue({
      message: err.message || 'Booking failed',
      status: err.status || 500,
    });
  }
});

export const cancelPatientAppointment = createAsyncThunk('appointments/cancel', async (id, { rejectWithValue }) => {
  try {
    const res = await api.cancelAppointment(id);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const reschedulePatientAppointment = createAsyncThunk('appointments/reschedule', async ({ id, newSlotId }, { rejectWithValue }) => {
  try {
    const res = await api.rescheduleAppointment(id, newSlotId);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  appointments: [],
  filterYear: 'ALL',
  filterStatus: 'ALL',
  bookedAppointment: null,
  conflictError: null,
  loading: false,
  bookingLoading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setFilterYear: (state, action) => {
      state.filterYear = action.payload;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    clearConflictError: (state) => {
      state.conflictError = null;
    },
    clearBookedAppointment: (state) => {
      state.bookedAppointment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAppointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload || [];
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // bookNewAppointment
      .addCase(bookNewAppointment.pending, (state) => {
        state.bookingLoading = true;
        state.conflictError = null;
      })
      .addCase(bookNewAppointment.fulfilled, (state, action) => {
        state.bookingLoading = false;
        state.bookedAppointment = action.payload;
        state.appointments.unshift(action.payload);
      })
      .addCase(bookNewAppointment.rejected, (state, action) => {
        state.bookingLoading = false;
        if (action.payload?.status === 409) {
          state.conflictError = action.payload?.message || 'This slot was just booked by another patient. Please choose another available slot.';
        } else {
          state.error = action.payload?.message || 'Failed to book appointment';
        }
      })
      // cancelPatientAppointment
      .addCase(cancelPatientAppointment.fulfilled, (state, action) => {
        const cancelled = action.payload;
        state.appointments = state.appointments.map(a =>
          String(a._id || a.id) === String(cancelled._id || cancelled.id) ? { ...a, status: 'CANCELLED' } : a
        );
      });
  },
});

export const {
  setFilterYear,
  setFilterStatus,
  clearConflictError,
  clearBookedAppointment,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
