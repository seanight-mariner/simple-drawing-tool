import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface Shape {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
}

interface DrawingState {
  shapes: Shape[];
  selectedShape: string;
  selectedShapeId: string | null; // 추가: 선택된 도형 ID
  isResizing: boolean;
  isMoving: boolean;
}

const initialState: DrawingState = {
  shapes: [],
  selectedShape: 'rectangle',
  selectedShapeId: null, // 초기값은 null
  isResizing: false,
  isMoving: false,
};

export const drawingSlice = createSlice({
  name: 'drawing',
  initialState,
  reducers: {
    addShape: (state, action: PayloadAction<Shape>) => {
      state.shapes.push(action.payload);
    },
    setSelectedShape: (state, action: PayloadAction<string>) => {
      state.selectedShape = action.payload;
      state.selectedShapeId = null; // 도형 선택 모드가 바뀌면 선택 해제
    },
    setSelectedShapeId: (state, action: PayloadAction<string | null>) => {
      // 선택된 도형 ID 업데이트
      state.selectedShapeId = action.payload;
    },
    updateShapePosition: (state, action: PayloadAction<{ id: string; x: number; y: number; }>) => {
      const { id, x, y } = action.payload;
      const shapeIndex = state.shapes.findIndex((shape) => shape.id === id);
      if (shapeIndex !== -1) {
        state.shapes[shapeIndex] = { ...state.shapes[shapeIndex], x, y };
      }
    },
    updateShapeSize: (
      state,
      action: PayloadAction<{ id: string; width: number; height: number; }>
    ) => {
      const { id, width, height } = action.payload;
      const shapeIndex = state.shapes.findIndex((shape) => shape.id === id);
      if (shapeIndex !== -1) {
        state.shapes[shapeIndex] = { ...state.shapes[shapeIndex], width, height };
      }
    },
    deleteShape: (state) => { // 삭제 reducer 추가
      if (state.selectedShapeId) {
        state.shapes = state.shapes.filter((shape) => shape.id !== state.selectedShapeId);
        state.selectedShapeId = null; // 삭제 후 선택 해제
      }
    },
    reset: (state) => {
      // 상태 초기화
      state.shapes = [];
      state.selectedShape = 'rectangle';
      state.selectedShapeId = null;
    },
  },
});

export const {
  addShape,
  setSelectedShape,
  setSelectedShapeId,
  updateShapePosition,
  updateShapeSize,
  deleteShape,
  reset,
} = drawingSlice.actions;

export const selectIsResizing = (state: RootState) => state.drawing.isResizing;
export const selectIsMoving = (state: RootState) => state.drawing.isMoving;

export default drawingSlice.reducer;