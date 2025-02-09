import { updateShapeSize, updateShapePosition } from './features/drawingSlice';
import { selectIsResizing, selectIsMoving } from './features/drawingSlice';

const shouldSaveAction = (action: any, state: any) => {
  // 크기 조절 또는 이동 액션이 아니면 저장
//   if (action.type !== updateShapeSize.type && action.type !== updateShapePosition.type) {
//     return true;
//   }

  // 크기 조절 중이거나 이동 중이면 저장하지 않음
//   if (selectIsResizing(state) || selectIsMoving(state)) {
//     return false;
//   }

  // 그 외의 경우에는 저장
  return true;
};

export const selectiveSaveMiddleware = (store: any) => (next: any) => (action: any) => {
  if (shouldSaveAction(action, store.getState())) {
    return next(action);
  }

  return action; // 액션 무시
};