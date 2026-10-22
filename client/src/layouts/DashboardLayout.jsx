import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import TaskModal from '../components/tasks/TaskModal';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Provide context to children so any page can open the task modal if needed */}
          <Outlet context={{ openCreateTask: () => setIsNewTaskModalOpen(true) }} />
        </main>
      </div>

      {/* Global Quick New Task Modal */}
      <TaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSuccess={() => {
          setIsNewTaskModalOpen(false);
          // Dispatch a custom event so active pages (Dashboard, Tasks, Kanban) can refresh data
          window.dispatchEvent(new CustomEvent('taskflow:refresh'));
        }}
      />
    </div>
  );
};

export default DashboardLayout;
