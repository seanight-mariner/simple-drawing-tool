import { configureStore } from '@reduxjs/toolkit';
import drawingReducer from './features/drawingSlice';
import { selectiveSaveMiddleware } from './middleware';

export const store = configureStore({
  reducer: {
    drawing: drawingReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(selectiveSaveMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;