import React, { useState, useRef, useEffect } from 'react';

export type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface ShapeProps {
  shape: {
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    id: string;
  };

  isSelected: boolean; // 선택 여부 prop 추가
  onResizeStart?: (handle: ResizeHandle, event: React.MouseEvent) => void;
  onResize?: (handle: ResizeHandle, event: MouseEvent, deltaX: number, deltaY: number) => void;
  onResizeEnd?: (handle: ResizeHandle, event: MouseEvent) => void;
}

export const Shape: React.FC<ShapeProps> = ({ shape, isSelected, onResizeStart,
  onResize, onResizeEnd, }) => {
  const strokeWidth = isSelected ? '4' : '2'; // 선택되었으면 테두리 굵게
  const [isResizing, setIsResizing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const resizeRef = useRef<ResizeHandle | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !onResize) return;
      const deltaX = e.clientX - startPoint.x;
      const deltaY = e.clientY - startPoint.y;
      const handle = resizeRef.current as ResizeHandle;
      onResize(handle, e, deltaX, deltaY);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isResizing || !onResizeEnd) return;
      const handle = resizeRef.current as ResizeHandle;
      onResizeEnd(handle, e as MouseEvent);
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onResize, onResizeEnd, startPoint]);

  const handleResizeMouseDown = (
    event: React.MouseEvent,
    handle: ResizeHandle
  ) => {
    event.stopPropagation(); // 도형 선택 이벤트 막기
    setIsResizing(true);
    setStartPoint({ x: event.clientX, y: event.clientY });
    resizeRef.current = handle;
    onResizeStart?.(handle, event);
  };

  switch (shape.type) {
    case 'rectangle':
      return (
        <rect
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          fill="transparent"
          stroke="black"
          strokeWidth={strokeWidth}
        />
      );
    case 'circle':
      const radius = Math.min(shape.width, shape.height) / 2;
      return (
        <circle
          cx={shape.x + shape.width / 2}
          cy={shape.y + shape.height / 2}
          r={radius}
          fill="transparent"
          stroke="black"
          strokeWidth={strokeWidth}
        />
      );
    case 'dashedRectangle':
      return (
        <g>
          <rect
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill="transparent"
            stroke="black"
            strokeWidth={strokeWidth}
            strokeDasharray="5,5" // 점선 스타일 적용
          />
          {isSelected && (
            <>
              {/* 모서리 점 */}
              <circle
                cx={shape.x}
                cy={shape.y}
                r="5"
                fill="blue"
                style={{ cursor: 'nwse-resize' }}
                onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}
              />
              <circle
                cx={shape.x + shape.width}
                cy={shape.y}
                r="5"
                fill="blue"
                style={{ cursor: 'nesw-resize' }}
                onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}
              />
              <circle
                cx={shape.x}
                cy={shape.y + shape.height}
                r="5"
                fill="blue"
                style={{ cursor: 'nesw-resize' }}
                onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}
              />
              <circle
                cx={shape.x + shape.width}
                cy={shape.y + shape.height}
                r="5"
                fill="blue"
                style={{ cursor: 'nwse-resize' }}
                onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
              />
            </>
          )}
        </g>
      );
    default:
      return null;
  }
};