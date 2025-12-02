import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import FollowButton from '@/components/FollowButton'
import api from '@/lib/api'

// Mock the API module
jest.mock('@/lib/api', () => ({
  follow: {
    getFollowStatus: jest.fn(),
    followUser: jest.fn(),
    unfollowUser: jest.fn(),
  },
}))

describe('FollowButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state while fetching initial status', () => {
    api.follow.getFollowStatus.mockImplementation(() => new Promise(() => {}))

    render(<FollowButton userId="user-123" />)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows Follow button when not following', async () => {
    api.follow.getFollowStatus.mockResolvedValue({ isFollowing: false })

    render(<FollowButton userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByText('Follow')).toBeInTheDocument()
    })
  })

  it('shows Following button when following', async () => {
    api.follow.getFollowStatus.mockResolvedValue({ isFollowing: true })

    render(<FollowButton userId="user-123" />)

    await waitFor(() => {
      expect(screen.getByText('Following')).toBeInTheDocument()
    })
  })

  it('uses initialIsFollowing prop when provided', () => {
    render(<FollowButton userId="user-123" initialIsFollowing={true} />)

    expect(screen.getByText('Following')).toBeInTheDocument()
    expect(api.follow.getFollowStatus).not.toHaveBeenCalled()
  })

  it('calls followUser API when clicking Follow', async () => {
    api.follow.followUser.mockResolvedValue({ success: true })

    render(<FollowButton userId="user-123" initialIsFollowing={false} />)

    fireEvent.click(screen.getByText('Follow'))

    await waitFor(() => {
      expect(api.follow.followUser).toHaveBeenCalledWith('user-123')
    })
  })

  it('calls unfollowUser API when clicking Following', async () => {
    api.follow.unfollowUser.mockResolvedValue({ success: true })

    render(<FollowButton userId="user-123" initialIsFollowing={true} />)

    fireEvent.click(screen.getByText('Following'))

    await waitFor(() => {
      expect(api.follow.unfollowUser).toHaveBeenCalledWith('user-123')
    })
  })

  it('updates button state optimistically', async () => {
    api.follow.followUser.mockImplementation(() => new Promise(() => {}))

    render(<FollowButton userId="user-123" initialIsFollowing={false} />)

    fireEvent.click(screen.getByText('Follow'))

    // Should immediately show Following due to optimistic update
    await waitFor(() => {
      expect(screen.queryByText('Follow')).not.toBeInTheDocument()
    })
  })

  it('reverts state on API error', async () => {
    api.follow.followUser.mockRejectedValue(new Error('Network error'))

    render(<FollowButton userId="user-123" initialIsFollowing={false} />)

    fireEvent.click(screen.getByText('Follow'))

    await waitFor(() => {
      expect(screen.getByText('Follow')).toBeInTheDocument()
    })
  })

  it('calls onFollowChange callback on success', async () => {
    api.follow.followUser.mockResolvedValue({ success: true })
    const handleChange = jest.fn()

    render(
      <FollowButton
        userId="user-123"
        initialIsFollowing={false}
        onFollowChange={handleChange}
      />
    )

    fireEvent.click(screen.getByText('Follow'))

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(true)
    })
  })

  it('disables button during action', async () => {
    api.follow.followUser.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    )

    render(<FollowButton userId="user-123" initialIsFollowing={false} />)

    fireEvent.click(screen.getByText('Follow'))

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('prevents double-click during action', async () => {
    api.follow.followUser.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    )

    render(<FollowButton userId="user-123" initialIsFollowing={false} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.click(button)

    await waitFor(() => {
      expect(api.follow.followUser).toHaveBeenCalledTimes(1)
    })
  })

  it('applies custom className', () => {
    render(
      <FollowButton
        userId="user-123"
        initialIsFollowing={false}
        className="custom-class"
      />
    )

    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('does not fetch status when userId is missing', () => {
    render(<FollowButton userId="" />)

    expect(api.follow.getFollowStatus).not.toHaveBeenCalled()
  })
})
