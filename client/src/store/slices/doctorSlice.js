import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSpecializations = createAsyncThunk('doctors/fetchSpecializations', async (_, { rejectWithValue }) => {
  try {
    const res = await api.getSpecializations();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchDoctors = createAsyncThunk('doctors/fetchDoctors', async (params, { rejectWithValue }) => {
  try {
    const res = await api.getDoctors(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchFeaturedDoctors = createAsyncThunk('doctors/fetchFeaturedDoctors', async (_, { rejectWithValue }) => {
  try {
    const res = await api.getFeaturedDoctors();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchDoctorAvailability = createAsyncThunk('doctors/fetchAvailability', async ({ id, date }, { rejectWithValue }) => {
  try {
    const res = await api.getDoctorAvailability(id, date);
    return { id, date, slots: res.data };
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchDoctorFeePreview = createAsyncThunk('doctors/fetchFeePreview', async (id, { rejectWithValue }) => {
  try {
    const res = await api.getDoctorFeePreview(id);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  doctors: [],
  featuredDoctors: [],
  specializations: [],
  selectedDoctor: null,
  availabilitySlots: [],
  feePreview: null,
  selectedDepartment: 'All',
  selectedConsultationType: 'ALL',
  loading: false,
  error: null,
};

const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
    },
    setSelectedConsultationType: (state, action) => {
      state.selectedConsultationType = action.payload;
    },
    setSelectedDoctor: (state, action) => {
      state.selectedDoctor = action.payload;
    },
    clearDoctorSelection: (state) => {
      state.selectedDoctor = null;
      state.availabilitySlots = [];
      state.feePreview = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // specializations
      .addCase(fetchSpecializations.fulfilled, (state, action) => {
        state.specializations = action.payload || [];
      })
      // fetchDoctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload || [];
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchFeaturedDoctors
      .addCase(fetchFeaturedDoctors.fulfilled, (state, action) => {
        state.featuredDoctors = action.payload || [];
      })
      // availability
      .addCase(fetchDoctorAvailability.fulfilled, (state, action) => {
        state.availabilitySlots = action.payload.slots || [];
      })
      // fee preview
      .addCase(fetchDoctorFeePreview.fulfilled, (state, action) => {
        state.feePreview = action.payload;
      });
  },
});

export const {
  setSelectedDepartment,
  setSelectedConsultationType,
  setSelectedDoctor,
  clearDoctorSelection,
} = doctorSlice.actions;

export default doctorSlice.reducer;
