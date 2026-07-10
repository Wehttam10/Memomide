import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import TopicViewer from '../components/TopicViewer';
import { getTopic } from '../api/topics';
import { getNotes, createNote, deleteNote } from '../api/notes';
import { getAIStatus } from '../api/dashboard';
import { generateQuestions } from '../api/questions';

vi.mock('../api/topics', () => ({
  getTopic: vi.fn(),
  createTopic: vi.fn(),
  updateTopic: vi.fn(),
  deleteTopic: vi.fn(),
}));

vi.mock('../api/notes', () => ({
  getNotes: vi.fn(),
  createNote: vi.fn(),
  deleteNote: vi.fn(),
  updateNote: vi.fn(),
}));

vi.mock('../api/dashboard', () => ({
  getAIStatus: vi.fn(),
  getDashboardSummary: vi.fn(),
  getRevisionDue: vi.fn(),
  searchWorkspace: vi.fn(),
  getAwards: vi.fn(),
  getProfileStats: vi.fn(),
}));

vi.mock('../api/questions', () => ({
  generateQuestions: vi.fn(),
  getQuestions: vi.fn(),
  submitAttempt: vi.fn(),
  getAttempts: vi.fn(),
}));

describe('TopicViewer Component', () => {
  const topicId = 'topic-123';
  const mockTopic = {
    id: topicId,
    title: 'Functional Programming',
    description: 'Learn purity, immutability, and side effects.',
    status: 'learning',
  };
  const mockNotes = [
    { id: 'note-1', content: 'Pure functions have no side effects.' },
    { id: 'note-2', content: 'Immutability makes state changes explicit.' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    getAIStatus.mockResolvedValue({ mode: 'real_ai' });
  });

  it('renders loading state initially', async () => {
    // Return a promise that doesn't resolve immediately to check loading state
    let resolveTopic;
    getTopic.mockImplementationOnce(() => new Promise((resolve) => {
      resolveTopic = resolve;
    }));
    getNotes.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <TopicViewer topicId={topicId} onDeleted={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading topic/i)).toBeInTheDocument();
    
    // Resolve to avoid memory leaks/unhandled promises
    resolveTopic(mockTopic);
  });

  it('renders error state when API fails', async () => {
    getTopic.mockRejectedValueOnce(new Error('Failed to load topic metadata'));
    getNotes.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <TopicViewer topicId={topicId} onDeleted={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load topic metadata')).toBeInTheDocument();
    });
  });

  it('renders topic details and list of notes', async () => {
    getTopic.mockResolvedValueOnce(mockTopic);
    getNotes.mockResolvedValueOnce(mockNotes);

    render(
      <MemoryRouter>
        <TopicViewer topicId={topicId} onDeleted={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Functional Programming')).toBeInTheDocument();
      expect(screen.getByText('Learn purity, immutability, and side effects.')).toBeInTheDocument();
      expect(screen.getByText('Pure functions have no side effects.')).toBeInTheDocument();
      expect(screen.getByText('Immutability makes state changes explicit.')).toBeInTheDocument();
    });
  });

  it('renders empty state when there are no notes', async () => {
    getTopic.mockResolvedValueOnce(mockTopic);
    getNotes.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <TopicViewer topicId={topicId} onDeleted={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No sources added')).toBeInTheDocument();
    });
  });

  it('supports note creation via form submission', async () => {
    const user = userEvent.setup();
    getTopic.mockResolvedValue(mockTopic);
    getNotes
      .mockResolvedValueOnce(mockNotes) // initial load
      .mockResolvedValueOnce([...mockNotes, { id: 'note-3', content: 'New note content' }]); // load after save
    createNote.mockResolvedValueOnce({ id: 'note-3' });

    render(
      <MemoryRouter>
        <TopicViewer topicId={topicId} onDeleted={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Paste text from documents/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Paste text from documents/i);
    await user.type(textarea, 'New note content');

    const saveButton = screen.getByRole('button', { name: /save source/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(createNote).toHaveBeenCalledWith(topicId, { content: 'New note content' });
      expect(screen.getByText('New note content')).toBeInTheDocument();
    });
  });

  it('supports note deletion', async () => {
    const user = userEvent.setup();
    getTopic.mockResolvedValue(mockTopic);
    getNotes
      .mockResolvedValueOnce(mockNotes) // initial load
      .mockResolvedValueOnce([mockNotes[1]]); // load after delete
    deleteNote.mockResolvedValueOnce({ success: true });

    render(
      <MemoryRouter>
        <TopicViewer topicId={topicId} onDeleted={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pure functions have no side effects.')).toBeInTheDocument();
    });

    // Find and click Remove button for the first note
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    await waitFor(() => {
      expect(deleteNote).toHaveBeenCalledWith('note-1');
      expect(screen.queryByText('Pure functions have no side effects.')).not.toBeInTheDocument();
    });
  });

  it('triggers question generation and displays success banner', async () => {
    const user = userEvent.setup();
    getTopic.mockResolvedValue(mockTopic);
    getNotes.mockResolvedValue(mockNotes);
    generateQuestions.mockResolvedValueOnce({
      questions: [{ id: 'q-1' }, { id: 'q-2' }, { id: 'q-3' }],
      aiMode: 'real_ai',
      fallbackReason: '',
    });

    render(
      <MemoryRouter>
        <TopicViewer topicId={topicId} onDeleted={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /auto-generate questions/i })).toBeInTheDocument();
    });

    const generateBtn = screen.getByRole('button', { name: /auto-generate questions/i });
    await user.click(generateBtn);

    await waitFor(() => {
      expect(generateQuestions).toHaveBeenCalledWith(topicId);
      expect(screen.getByText('3 questions generated with Gemini AI.')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /practice now/i })).toBeInTheDocument();
    });
  });
});
