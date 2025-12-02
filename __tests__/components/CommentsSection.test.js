import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CommentsSection from '@/components/CommentsSection'
import api from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'

// Mock the API module
jest.mock('@/lib/api', () => ({
  social: {
    getComments: jest.fn(),
    addComment: jest.fn(),
    deleteComment: jest.fn(),
  },
}))

// Mock the auth context
jest.mock('@/lib/AuthContext', () => ({
  useAuth: jest.fn(),
}))

const mockUser = {
  _id: 'user-123',
  username: 'testuser',
  displayName: 'Test User',
  avatarUrl: null,
}

const mockComments = [
  {
    _id: 'comment-1',
    text: 'Great list!',
    createdAt: new Date().toISOString(),
    user: {
      _id: 'user-456',
      username: 'otheruser',
      displayName: 'Other User',
    },
  },
  {
    _id: 'comment-2',
    text: 'Thanks for sharing',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    user: {
      _id: 'user-123',
      username: 'testuser',
      displayName: 'Test User',
    },
  },
]

describe('CommentsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuth.mockReturnValue({ user: mockUser })
    window.confirm = jest.fn(() => true)
  })

  it('shows loading state initially', () => {
    api.social.getComments.mockImplementation(() => new Promise(() => {}))

    const { container } = render(<CommentsSection listId="507f1f77bcf86cd799439011" />)

    // Should show loading spinner
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('displays comments after loading', async () => {
    api.social.getComments.mockResolvedValue({
      comments: mockComments,
      hasMore: false,
    })

    render(<CommentsSection listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      expect(screen.getByText('Great list!')).toBeInTheDocument()
      expect(screen.getByText('Thanks for sharing')).toBeInTheDocument()
    })
  })

  it('shows empty state when no comments', async () => {
    api.social.getComments.mockResolvedValue({
      comments: [],
      hasMore: false,
    })

    render(<CommentsSection listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      expect(screen.getByText('No comments yet')).toBeInTheDocument()
      expect(screen.getByText('Be the first to share your thoughts!')).toBeInTheDocument()
    })
  })

  it('shows comment input when logged in', async () => {
    api.social.getComments.mockResolvedValue({ comments: [], hasMore: false })

    render(<CommentsSection listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument()
    })
  })

  it('shows login prompt when not logged in', async () => {
    useAuth.mockReturnValue({ user: null })
    api.social.getComments.mockResolvedValue({ comments: [], hasMore: false })

    render(<CommentsSection listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      expect(screen.getByText('Log in')).toBeInTheDocument()
      expect(screen.getByText(/to leave a comment/)).toBeInTheDocument()
    })
  })

  it('submits a new comment', async () => {
    api.social.getComments.mockResolvedValue({ comments: [], hasMore: false })
    api.social.addComment.mockResolvedValue({
      comment: {
        _id: 'new-comment',
        text: 'My new comment',
        createdAt: new Date().toISOString(),
        user: mockUser,
      },
    })

    render(<CommentsSection listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('Write a comment...')
    fireEvent.change(input, { target: { value: 'My new comment' } })
    fireEvent.click(screen.getByText('Post'))

    await waitFor(() => {
      expect(api.social.addComment).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'My new comment'
      )
    })

    await waitFor(() => {
      expect(screen.getByText('My new comment')).toBeInTheDocument()
    })
  })

  it('clears input after successful submission', async () => {
    api.social.getComments.mockResolvedValue({ comments: [], hasMore: false })
    api.social.addComment.mockResolvedValue({
      comment: {
        _id: 'new-comment',
        text: 'Test comment',
        createdAt: new Date().toISOString(),
        user: mockUser,
      },
    })

    render(<CommentsSection listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('Write a comment...')
    fireEvent.change(input, { target: { value: 'Test comment' } })
    fireEvent.click(screen.getByText('Post'))

    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('disables Post button when input is empty', async () => {
    api.social.getComments.mockResolvedValue({ comments: [], hasMore: false })

    render(<CommentsSection listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      expect(screen.getByText('Post')).toBeDisabled()
    })
  })

  it('shows delete button only for own comments', async () => {
    api.social.getComments.mockResolvedValue({
      comments: mockComments,
      hasMore: false,
    })

    render(<CommentsSection listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      // Only one delete button should be visible (for user-123's comment)
      expect(screen.getAllByText('Delete')).toHaveLength(1)
    })
  })

  it('deletes a comment after confirmation', async () => {
    api.social.getComments.mockResolvedValue({
      comments: mockComments,
      hasMore: false,
    })
    api.social.deleteComment.mockResolvedValue({ success: true })

    render(<CommentsSection listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      expect(screen.getByText('Thanks for sharing')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Delete'))

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled()
      expect(api.social.deleteComment).toHaveBeenCalledWith('comment-2')
    })

    await waitFor(() => {
      expect(screen.queryByText('Thanks for sharing')).not.toBeInTheDocument()
    })
  })

  it('shows character count warning near limit', async () => {
    api.social.getComments.mockResolvedValue({ comments: [], hasMore: false })

    render(<CommentsSection listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('Write a comment...')
    const longText = 'a'.repeat(450)
    fireEvent.change(input, { target: { value: longText } })

    expect(screen.getByText(/characters remaining/)).toBeInTheDocument()
  })

  it('disables Post button when over character limit', async () => {
    api.social.getComments.mockResolvedValue({ comments: [], hasMore: false })

    render(<CommentsSection listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('Write a comment...')
    const tooLongText = 'a'.repeat(501)
    fireEvent.change(input, { target: { value: tooLongText } })

    expect(screen.getByText('Post')).toBeDisabled()
  })

  it('shows Load more button when hasMore is true', async () => {
    api.social.getComments.mockResolvedValue({
      comments: mockComments,
      hasMore: true,
    })

    render(<CommentsSection listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      expect(screen.getByText('Load more comments')).toBeInTheDocument()
    })
  })

  it('loads more comments when clicking Load more', async () => {
    api.social.getComments
      .mockResolvedValueOnce({
        comments: mockComments,
        hasMore: true,
      })
      .mockResolvedValueOnce({
        comments: [
          {
            _id: 'comment-3',
            text: 'Another comment',
            createdAt: new Date().toISOString(),
            user: { _id: 'user-789', username: 'third' },
          },
        ],
        hasMore: false,
      })

    render(<CommentsSection listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      expect(screen.getByText('Load more comments')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Load more comments'))

    await waitFor(() => {
      expect(screen.getByText('Another comment')).toBeInTheDocument()
    })
  })

  it('formats relative time correctly', async () => {
    const now = new Date()
    api.social.getComments.mockResolvedValue({
      comments: [
        {
          _id: 'comment-1',
          text: 'Just now',
          createdAt: now.toISOString(),
          user: { _id: 'user-1', username: 'user1' },
        },
        {
          _id: 'comment-2',
          text: 'Minutes ago',
          createdAt: new Date(now.getTime() - 30 * 60000).toISOString(), // 30 min ago
          user: { _id: 'user-2', username: 'user2' },
        },
        {
          _id: 'comment-3',
          text: 'Hours ago',
          createdAt: new Date(now.getTime() - 5 * 3600000).toISOString(), // 5 hours ago
          user: { _id: 'user-3', username: 'user3' },
        },
      ],
      hasMore: false,
    })

    render(<CommentsSection listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      expect(screen.getByText('just now')).toBeInTheDocument()
      expect(screen.getByText('30m ago')).toBeInTheDocument()
      expect(screen.getByText('5h ago')).toBeInTheDocument()
    })
  })

  it('calls onCommentCountChange when adding comment', async () => {
    api.social.getComments.mockResolvedValue({ comments: [], hasMore: false })
    api.social.addComment.mockResolvedValue({
      comment: {
        _id: 'new-comment',
        text: 'Test',
        createdAt: new Date().toISOString(),
        user: mockUser,
      },
    })
    const handleCountChange = jest.fn()

    render(
      <CommentsSection
        listId="507f1f77bcf86cd799439011"
        onCommentCountChange={handleCountChange}
      />
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText('Write a comment...'), {
      target: { value: 'Test' },
    })
    fireEvent.click(screen.getByText('Post'))

    await waitFor(() => {
      expect(handleCountChange).toHaveBeenCalledWith(1)
    })
  })

  it('applies custom className', async () => {
    api.social.getComments.mockResolvedValue({ comments: [], hasMore: false })

    const { container } = render(
      <CommentsSection
        listId="507f1f77bcf86cd799439011"
        className="custom-class"
      />
    )

    await waitFor(() => {
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
