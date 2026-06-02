import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomTabBar from './BottomTabBar';

export default function AppShell() {
  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-background relative">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
}