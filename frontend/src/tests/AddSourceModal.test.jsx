import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AddSourceModal from '../components/AddSourceModal';
import { createTopic } from '../api/topics';
import { createNote } from '../api/notes';

vi.mock('../api/topics', () => ({
  createTopic: vi.fn(),
  getTopic: vi.fn(),
  getTopics: vi.fn(),
  updateTopic: vi.fn(),
  deleteTopic: vi.fn(),
}));

vi.mock('../api/notes', () => ({
  createNote: vi.fn(),
  getNotes: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}));

describe('AddSourceModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSourceAdded = vi.fn();
  const subjectId = 'subject-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AddSourceModal 
        isOpen={false} 
        onClose={mockOnClose} 
        subjectId={subjectId} 
        onSourceAdded={mockOnSourceAdded} 
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal options when isOpen is true', () => {
    render(
      <AddSourceModal 
        isOpen={true} 
        onClose={mockOnClose} 
        subjectId={subjectId} 
        onSourceAdded={mockOnSourceAdded} 
      />
    );
    expect(screen.getByText('or drop your files')).toBeInTheDocument();
    expect(screen.getByText('pdf, docs, text, markdown, csv, and more')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload files/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copied text/i })).toBeInTheDocument();
  });

  it('supports text pasting and saving', async () => {
    const user = userEvent.setup();
    createTopic.mockResolvedValueOnce({ id: 'topic-999', title: 'Pasted Text' });
    createNote.mockResolvedValueOnce({ id: 'note-777' });

    render(
      <AddSourceModal 
        isOpen={true} 
        onClose={mockOnClose} 
        subjectId={subjectId} 
        onSourceAdded={mockOnSourceAdded} 
      />
    );

    // Switch to text view
    await user.click(screen.getByRole('button', { name: /copied text/i }));
    
    // Check text paste screen is rendered
    expect(screen.getByPlaceholderText('Paste your notes, articles, or text here...')).toBeInTheDocument();
    
    const textarea = screen.getByPlaceholderText('Paste your notes, articles, or text here...');
    await user.type(textarea, 'This is some pasted study note content.');

    // Save note
    await user.click(screen.getByRole('button', { name: /add source/i }));

    await waitFor(() => {
      expect(createTopic).toHaveBeenCalledWith(subjectId, { title: 'Pasted Text', description: '' });
      expect(createNote).toHaveBeenCalledWith('topic-999', { content: 'This is some pasted study note content.' });
      expect(mockOnSourceAdded).toHaveBeenCalledWith('topic-999');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles TXT file upload parsing and creates a source', async () => {
    const user = userEvent.setup();
    createTopic.mockResolvedValueOnce({ id: 'topic-888', title: 'notes.txt' });
    createNote.mockResolvedValueOnce({ id: 'note-555' });

    render(
      <AddSourceModal 
        isOpen={true} 
        onClose={mockOnClose} 
        subjectId={subjectId} 
        onSourceAdded={mockOnSourceAdded} 
      />
    );

    const file = new File(['Hello text file contents!'], 'notes.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText ? screen.queryByLabelText(/upload files/i) : null;
    
    // Find input element by its hidden tag
    const hiddenInput = screen.getByTestId ? screen.queryByTestId('file-input') : document.querySelector('input[type="file"]');
    expect(hiddenInput).toBeInTheDocument();

    // Trigger input change
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(createTopic).toHaveBeenCalledWith(subjectId, { title: 'notes.txt', description: '' });
      expect(createNote).toHaveBeenCalledWith('topic-888', { content: 'Hello text file contents!' });
      expect(mockOnSourceAdded).toHaveBeenCalledWith('topic-888');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('alerts the user when API call fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Network error database offline';
    createTopic.mockRejectedValueOnce(new Error(errorMessage));

    render(
      <AddSourceModal 
        isOpen={true} 
        onClose={mockOnClose} 
        subjectId={subjectId} 
        onSourceAdded={mockOnSourceAdded} 
      />
    );

    // Switch to text view
    await user.click(screen.getByRole('button', { name: /copied text/i }));
    const textarea = screen.getByPlaceholderText('Paste your notes, articles, or text here...');
    await user.type(textarea, 'Important stuff.');

    // Save
    await user.click(screen.getByRole('button', { name: /add source/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to add source: ' + errorMessage);
    });
  });
});
