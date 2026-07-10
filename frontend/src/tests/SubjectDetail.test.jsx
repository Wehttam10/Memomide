import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SubjectDetail from '../pages/SubjectDetail';
import { getSubject } from '../api/subjects';
import { getTopics } from '../api/topics';

// Mock useParams to return a fixed subjectId
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ subjectId: 'subject-123' }),
  };
});

vi.mock('../api/subjects', () => ({
  getSubject: vi.fn(),
  getSubjects: vi.fn(),
  createSubject: vi.fn(),
  updateSubject: vi.fn(),
  deleteSubject: vi.fn(),
  chatWithSubject: vi.fn(),
}));

vi.mock('../api/topics', () => ({
  getTopics: vi.fn(),
  getTopic: vi.fn(),
  createTopic: vi.fn(),
  updateTopic: vi.fn(),
  deleteTopic: vi.fn(),
}));

// Mock sub-components to isolate SubjectDetail tests
vi.mock('../components/TopicViewer', () => ({
  default: ({ topicId }) => (
    <div data-testid="topic-viewer">TopicViewer ID: {topicId}</div>
  ),
}));

vi.mock('../components/SubjectChat', () => ({
  default: ({ subjectId }) => (
    <div data-testid="subject-chat">SubjectChat ID: {subjectId}</div>
  ),
}));

vi.mock('../components/AddSourceModal', () => ({
  default: ({ isOpen, subjectId }) => (
    isOpen ? <div data-testid="add-source-modal">AddSourceModal subjectId: {subjectId}</div> : null
  ),
}));

vi.mock('../components/SwipeableSourceItem', () => ({
  default: ({ topic, isSelected, onClick, onDelete }) => (
    <button 
      onClick={onClick} 
      data-testid={`topic-item-${topic.id}`}
      className={isSelected ? 'selected' : ''}
    >
      <span>{topic.title}</span>
      <span>{topic.status}</span>
      <button onClick={(e) => { e.stopPropagation(); onDelete(topic.id); }}>Remove</button>
    </button>
  ),
}));

describe('SubjectDetail Component', () => {
  const mockSubject = {
    id: 'subject-123',
    name: 'Computer Science',
    description: 'Core concepts of computing.',
  };

  const mockTopics = [
    { id: 'topic-1', title: 'Data Structures', status: 'learning' },
    { id: 'topic-2', title: 'Algorithms', status: 'review' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    getSubject.mockResolvedValue(mockSubject);
    getTopics.mockResolvedValue(mockTopics);
  });

  it('renders subject details and sidebar topics', async () => {
    render(
      <MemoryRouter>
        <SubjectDetail />
      </MemoryRouter>
    );

    // Wait for the mock API calls to finish and details to render
    await waitFor(() => {
      expect(screen.getAllByText('Computer Science')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Core concepts of computing.')[0]).toBeInTheDocument();
      expect(screen.getByText('Data Structures')).toBeInTheDocument();
      expect(screen.getByText('Algorithms')).toBeInTheDocument();
    });
  });

  it('renders Subject Guide by default when no topic is selected', async () => {
    render(
      <MemoryRouter>
        <SubjectDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Subject Guide')).toBeInTheDocument();
      // Should show the welcome panel, not TopicViewer
      expect(screen.queryByTestId('topic-viewer')).not.toBeInTheDocument();
    });
  });

  it('selects a topic to switch views to TopicViewer', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SubjectDetail />
      </MemoryRouter>
    );

    // Click on "Data Structures" topic
    await waitFor(() => {
      expect(screen.getByTestId('topic-item-topic-1')).toBeInTheDocument();
    });

    const topicButton = screen.getByTestId('topic-item-topic-1');
    await user.click(topicButton);

    // Now TopicViewer should be rendered with the selected topic's ID
    await waitFor(() => {
      const topicViewer = screen.getByTestId('topic-viewer');
      expect(topicViewer).toBeInTheDocument();
      expect(topicViewer).toHaveTextContent('TopicViewer ID: topic-1');
    });
  });

  it('toggles the chat panel visibility', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SubjectDetail />
      </MemoryRouter>
    );

    // Initially, the chat panel is open
    await waitFor(() => {
      expect(screen.getByTestId('subject-chat')).toBeInTheDocument();
    });

    // Find the toggle chat button
    const chatToggleBtn = document.querySelector('button .lucide-message-square')?.closest('button');
    expect(chatToggleBtn).toBeInTheDocument();

    // Click to close chat panel
    await user.click(chatToggleBtn);
    expect(screen.queryByTestId('subject-chat')).not.toBeInTheDocument();

    // Click to reopen chat panel
    await user.click(chatToggleBtn);
    expect(screen.getByTestId('subject-chat')).toBeInTheDocument();
  });

  it('sidebar is initially expanded and can render expand button if collapsed', async () => {
    render(
      <MemoryRouter>
        <SubjectDetail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Computer Science')[0]).toBeInTheDocument();
    });

    // Since the sidebar is open initially, the ChevronRight expand button shouldn't exist
    const expandButton = screen.queryByRole('button', { name: '' });
    // Verify there is no button containing only ChevronRight (expand button)
    const chevronRightButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg.lucide-chevron-right'));
    expect(chevronRightButtons.length).toBe(0);
  });
});
