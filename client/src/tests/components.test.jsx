import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/common/Badges';
import TaskCard from '../components/tasks/TaskCard';
import EmptyState from '../components/common/EmptyState';
import ConfirmationModal from '../components/common/ConfirmationModal';
import LandingPage from '../pages/LandingPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

describe('Badges Components', () => {
  it('renders StatusBadge with correct text and styling', () => {
    render(<StatusBadge status="In Progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders PriorityBadge with correct text', () => {
    render(<PriorityBadge priority="High" />);
    expect(screen.getByText('High Priority')).toBeInTheDocument();
  });

  it('renders CategoryBadge with category name', () => {
    render(<CategoryBadge category="Project" />);
    expect(screen.getByText('Project')).toBeInTheDocument();
  });
});

describe('TaskCard Component', () => {
  const mockTask = {
    _id: 'task-123',
    title: 'Design Database Schema',
    description: 'Create Mongoose models with compound indexes',
    status: 'In Progress',
    priority: 'High',
    category: 'Work',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
  };

  it('renders task title, description, and badges', () => {
    render(
      <TaskCard
        task={mockTask}
        onToggleComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Design Database Schema')).toBeInTheDocument();
    expect(screen.getByText('Create Mongoose models with compound indexes')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('High Priority')).toBeInTheDocument();
  });

  it('calls onToggleComplete when completion button is clicked', () => {
    const handleToggle = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        onToggleComplete={handleToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const toggleBtn = screen.getByLabelText('Mark complete');
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledWith(mockTask);
  });
});

describe('EmptyState Component', () => {
  it('renders title, description and triggers action button', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No tasks found"
        description="Try adjusting your filters"
        actionLabel="Create Task"
        onAction={handleAction}
      />
    );

    expect(screen.getByText('No tasks found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();

    const button = screen.getByText('Create Task');
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalled();
  });
});

describe('ConfirmationModal Component', () => {
  it('renders modal with title and message when open and triggers onConfirm', () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <ConfirmationModal
        isOpen={true}
        title="Delete Item"
        message="Are you sure you want to delete this item?"
        confirmText="Confirm Delete"
        onConfirm={handleConfirm}
        onClose={handleClose}
      />
    );

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();

    const confirmBtn = screen.getByText('Confirm Delete');
    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    render(
      <ConfirmationModal
        isOpen={false}
        title="Hidden Modal"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByText('Hidden Modal')).not.toBeInTheDocument();
  });
});

describe('LandingPage Component', () => {
  it('renders hero title and marketing CTA', () => {
    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <LandingPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Organize Daily Tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/Master Every Deadline/i)).toBeInTheDocument();
  });
});
