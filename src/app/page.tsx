'use client';
import { Canvas, Toolbar, reset } from '@/features/drawing-app';
import { useEffect } from 'react';
import { useAppDispatch } from '@/features/drawing-app';

export default function DrawingPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      dispatch(reset());
      console.log('DrawingPage unmounted: Redux state reset.');
    };
  }, [dispatch]);

  return (
    <div className="bg-gradient-radial from-purple-500 to-blue-500 h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Toolbar className="w-[800px]" />
        <Canvas />
      </div>
    </div>
  );
}