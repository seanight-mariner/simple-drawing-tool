'use client';
import React from 'react';
import { useAppDispatch, useAppSelector } from '@/features/drawing-app';
import { setSelectedShape, deleteShape } from '@/features/drawing-app';

interface ToolbarProps {
  className?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const selectedShape = useAppSelector((state) => state.drawing.selectedShape);
  const selectedShapeId = useAppSelector((state) => state.drawing.selectedShapeId); // 선택된 도형 ID 가져오기

  const handleShapeSelect = (shapeType: string) => {
    dispatch(setSelectedShape(shapeType));
  };

  const handleDeleteShape = () => {
    dispatch(deleteShape());
  };

  const handleSave = () => {
    const svg = document.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      canvas.width = 800; // 캔버스 크기
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('캔버스 컨텍스트를 가져올 수 없습니다.');
        return;
      }

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const pngData = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngData;
        downloadLink.download = 'drawing.png';
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div className={`bg-gray-100 p-4 flex space-x-4 justify-center ${className}`}> {/* className prop 적용 */}
      <button
        className={`px-4 py-2 rounded-md ${selectedShape === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}
        onClick={() => handleShapeSelect('select')}
      >
        Select
      </button>
      <button
        className={`px-4 py-2 rounded-md bg-red-500 text-white ${selectedShapeId === null ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        onClick={handleDeleteShape}
        disabled={selectedShapeId === null} // 선택된 도형이 없을 때 비활성화
      >
        Delete
      </button>
      <button className="px-4 py-2 rounded-md bg-green-500 text-white" onClick={handleSave}>
        Save
      </button>
      <button
        className={`px-4 py-2 rounded-md ${selectedShape === 'rectangle' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}
        onClick={() => handleShapeSelect('rectangle')}
      >
        Rectangle
      </button>
      <button
        className={`px-4 py-2 rounded-md ${selectedShape === 'circle' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}
        onClick={() => handleShapeSelect('circle')}
      >
        Circle
      </button>
      <button
        className={`px-4 py-2 rounded-md ${selectedShape === 'dashedRectangle' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}
        onClick={() => handleShapeSelect('dashedRectangle')}
      >
        Group
      </button>
    </div>
  );
};

export default Toolbar;