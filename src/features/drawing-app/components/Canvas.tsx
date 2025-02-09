'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/features/drawing-app';
import {
  addShape,
  setSelectedShapeId,
  updateShapePosition,
  updateShapeSize,
  startResizing,
  stopResizing,
  startMoving,
  stopMoving,
} from '@/features/drawing-app';
import { Shape, ResizeHandle } from './Shape';

interface Point {
  x: number;
  y: number;
}

interface ShapeProps {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
}

const Canvas: React.FC = () => {
  const canvasRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const selectedShape = useAppSelector((state) => state.drawing.selectedShape);
  const shapes = useAppSelector((state) => state.drawing.shapes);
  const selectedShapeId = useAppSelector((state) => state.drawing.selectedShapeId); // 선택된 도형 ID
  const dispatch = useAppDispatch();

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // 크기 조절 관련 상태
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [initialShape, setInitialShape] = useState<ShapeProps | null>(null);

  // 점선 사각형 클릭 판정 로직
  const isPointNearLine = (
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    maxDist: number
  ) => {
    const dist = Math.abs(
      (y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1
    ) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
    return dist <= maxDist;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedShape === 'select') {
      // 선택 모드일 때, 클릭한 도형 찾기
      const clickedShape = shapes.find((shape) => {
        if (shape.type === 'dashedRectangle') {
          // 점선 사각형 선택 로직
          const near = 10; // 선택 가능한 최대 거리 (px)
          return (
            isPointNearLine(x, y, shape.x, shape.y, shape.x + shape.width, shape.y, near) || // top
            isPointNearLine(x, y, shape.x + shape.width, shape.y, shape.x + shape.width, shape.y + shape.height, near) || // right
            isPointNearLine(x, y, shape.x + shape.width, shape.y + shape.height, shape.x, shape.y + shape.height, near) || // bottom
            isPointNearLine(x, y, shape.x, shape.y + shape.height, shape.x, shape.y, near)  // left
          );
        } else {
          // 다른 도형 선택 로직 (기존 로직 유지)
          return (
            x >= shape.x &&
            x <= shape.x + shape.width &&
            y >= shape.y &&
            y <= shape.y + shape.height
          );
        }
      });

      if (clickedShape) {
        dispatch(setSelectedShapeId(clickedShape.id));
        dispatch(startMoving()); // 이동 시작 액션 dispatch
        setIsDragging(true);
        setDragOffset({ x: x - clickedShape.x, y: y - clickedShape.y });
      } else {
        dispatch(setSelectedShapeId(null)); // 선택 해제
      }
    } else {
      // 그리기 모드일 때
      setIsDrawing(true);
      setStartPoint({ x, y });
      setCurrentPoint({ x, y });
      dispatch(setSelectedShapeId(null)); // 그리기 모드에서는 선택 해제
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isResizing && selectedShapeId && resizeHandle && initialShape) {
      // 크기 조절 로직
      let newWidth = initialShape.width;
      let newHeight = initialShape.height;
      let newX = initialShape.x;
      let newY = initialShape.y;

      switch (resizeHandle) {
        case 'top-left':
          newWidth = initialShape.width + (initialShape.x - x);
          newHeight = initialShape.height + (initialShape.y - y);
          newX = x;
          newY = y;
          break;
        case 'top-right':
          newWidth = x - initialShape.x;
          newHeight = initialShape.height + (initialShape.y - y);
          newY = y;
          break;
        case 'bottom-left':
          newWidth = initialShape.width + (initialShape.x - x);
          newHeight = y - initialShape.y;
          newX = x;
          break;
        case 'bottom-right':
          newWidth = x - initialShape.x;
          newHeight = y - initialShape.y;
          break;
      }

      if (newWidth > 10 && newHeight > 10) {
        dispatch(
          updateShapeSize({
            id: selectedShapeId,
            width: newWidth,
            height: newHeight,
          })
        );
        dispatch(
          updateShapePosition({
            id: selectedShapeId,
            x: newX,
            y: newY,
          })
        );
      }
    } else if (isDragging && selectedShapeId) {
      dispatch(
        updateShapePosition({
          id: selectedShapeId,
          x: x - dragOffset.x,
          y: y - dragOffset.y,
        })
      );
    } else if (isDrawing) {
      setCurrentPoint({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dispatch(stopMoving()); // 이동 종료 액션 dispatch
    setIsResizing(false);
    setResizeHandle(null);
    setInitialShape(null); // 초기 도형 정보 초기화

    if (isDrawing) {
      setIsDrawing(false);
      if (!startPoint || !currentPoint) return;

      const newShape = {
        type: selectedShape,
        x: startPoint.x,
        y: startPoint.y,
        width: Math.abs(currentPoint.x - startPoint.x),
        height: Math.abs(currentPoint.y - startPoint.y),
        id: Date.now().toString(),
      };
      dispatch(addShape(newShape));
      setStartPoint(null);
      setCurrentPoint(null);
    }
  };

  const handleResizeStart = (handle: ResizeHandle, event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(startResizing()); // 크기 조절 시작 액션 dispatch
    setIsResizing(true);
    setResizeHandle(handle);

    const selectedShape = shapes.find((shape) => shape.id === selectedShapeId);
    if (selectedShape) {
      setInitialShape({ ...selectedShape });
    }
  };

  const handleResize = (handle: ResizeHandle, event: any, deltaX: number, deltaY: number) => {
    if (!selectedShapeId || !initialShape) return;

    let newWidth = initialShape.width;
    let newHeight = initialShape.height;
    let newX = initialShape.x;
    let newY = initialShape.y;

    switch (handle) {
      case 'top-left':
        newWidth = initialShape.width - deltaX;
        newHeight = initialShape.height - deltaY;
        newX = initialShape.x + deltaX;
        newY = initialShape.y + deltaY;
        break;
      case 'top-right':
        newWidth = initialShape.width + deltaX;
        newHeight = initialShape.height - deltaY;
        newY = initialShape.y + deltaY;
        break;
      case 'bottom-left':
        newWidth = initialShape.width - deltaX;
        newHeight = initialShape.height + deltaY;
        newX = initialShape.x + deltaX;
        break;
      case 'bottom-right':
        newWidth = initialShape.width + deltaX;
        newHeight = initialShape.height + deltaY;
        break;
    }

    // 최소 크기 제한
    if (newWidth > 10 && newHeight > 10) {
      dispatch(
        updateShapeSize({
          id: selectedShapeId,
          width: newWidth,
          height: newHeight,
        })
      );

      dispatch(
        updateShapePosition({
          id: selectedShapeId,
          x: newX,
          y: newY,
        })
      );
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    dispatch(stopResizing()); // 크기 조절 종료 액션 dispatch
    setResizeHandle(null);
    setInitialShape(null);
  };

  useEffect(() => {
    const handleMouseLeave = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      setInitialShape(null);

      if (isDrawing) {
        setIsDrawing(false);
        setStartPoint(null);
        setCurrentPoint(null);
      }
    };

    window.addEventListener('mouseup', handleMouseLeave);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mouseup', handleMouseLeave);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDrawing]);


  return (
    <div className="flex justify-center items-center h-full"> {/* Container for centering */}
      <svg
        ref={canvasRef}
        width="800" // 고정된 가로 크기
        height="600" // 고정된 세로 크기
        style={{ backgroundColor: 'white' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {shapes.map((shape) => (
          <Shape key={shape.id} shape={shape}
            isSelected={selectedShapeId === shape.id} // 선택 여부 전달
            onResizeStart={handleResizeStart}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
        ))}
        {isDrawing && startPoint && currentPoint && (
          <Shape
            shape={{
              type: selectedShape,
              x: startPoint.x,
              y: startPoint.y,
              width: Math.abs(currentPoint.x - startPoint.x),
              height: Math.abs(currentPoint.y - startPoint.y),
              id: 'temp',
            }}
            isSelected={false}
          />
        )}
      </svg>
    </div>
  );
};

export default Canvas;