import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LikeButton from '@/components/LikeButton'
import api from '@/lib/api'

// Mock the API module
jest.mock('@/lib/api', () => ({
  social: {
    getLikeStatus: jest.fn(),
    likeList: jest.fn(),
    unlikeList: jest.fn(),
  },
}))

describe('LikeButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state while fetching initial status', () => {
    api.social.getLikeStatus.mockImplementation(() => new Promise(() => {}))

    render(<LikeButton listId="507f1f77bcf86cd799439011" />)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows empty heart when not liked', async () => {
    api.social.getLikeStatus.mockResolvedValue({ isLiked: false, likeCount: 0 })

    const { container } = render(<LikeButton listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('fill', 'none')
    })
  })

  it('shows filled heart when liked', async () => {
    api.social.getLikeStatus.mockResolvedValue({ isLiked: true, likeCount: 5 })

    const { container } = render(<LikeButton listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('fill', 'currentColor')
    })
  })

  it('displays like count when greater than 0', async () => {
    api.social.getLikeStatus.mockResolvedValue({ isLiked: true, likeCount: 42 })

    render(<LikeButton listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument()
    })
  })

  it('hides like count when 0', async () => {
    api.social.getLikeStatus.mockResolvedValue({ isLiked: false, likeCount: 0 })

    render(<LikeButton listId="507f1f77bcf86cd799439011" />)

    await waitFor(() => {
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })
  })

  it('hides like count when showCount is false', async () => {
    api.social.getLikeStatus.mockResolvedValue({ isLiked: true, likeCount: 10 })

    render(<LikeButton listId="507f1f77bcf86cd799439011" showCount={false} />)

    await waitFor(() => {
      expect(screen.queryByText('10')).not.toBeInTheDocument()
    })
  })

  it('uses initial props when provided', () => {
    render(
      <LikeButton
        listId="507f1f77bcf86cd799439011"
        initialIsLiked={true}
        initialLikeCount={25}
      />
    )

    expect(screen.getByText('25')).toBeInTheDocument()
    expect(api.social.getLikeStatus).not.toHaveBeenCalled()
  })

  it('calls likeList API when clicking to like', async () => {
    api.social.likeList.mockResolvedValue({ success: true })

    render(
      <LikeButton
        listId="507f1f77bcf86cd799439011"
        initialIsLiked={false}
        initialLikeCount={5}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(api.social.likeList).toHaveBeenCalledWith('507f1f77bcf86cd799439011')
    })
  })

  it('calls unlikeList API when clicking to unlike', async () => {
    api.social.unlikeList.mockResolvedValue({ success: true })

    render(
      <LikeButton
        listId="507f1f77bcf86cd799439011"
        initialIsLiked={true}
        initialLikeCount={5}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(api.social.unlikeList).toHaveBeenCalledWith('507f1f77bcf86cd799439011')
    })
  })

  it('increments count optimistically when liking', async () => {
    api.social.likeList.mockImplementation(() => new Promise(() => {}))

    render(
      <LikeButton
        listId="507f1f77bcf86cd799439011"
        initialIsLiked={false}
        initialLikeCount={5}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText('6')).toBeInTheDocument()
    })
  })

  it('decrements count optimistically when unliking', async () => {
    api.social.unlikeList.mockImplementation(() => new Promise(() => {}))

    render(
      <LikeButton
        listId="507f1f77bcf86cd799439011"
        initialIsLiked={true}
        initialLikeCount={5}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument()
    })
  })

  it('reverts state on API error', async () => {
    api.social.likeList.mockRejectedValue(new Error('Network error'))

    render(
      <LikeButton
        listId="507f1f77bcf86cd799439011"
        initialIsLiked={false}
        initialLikeCount={5}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  it('calls onLikeChange callback on success', async () => {
    api.social.likeList.mockResolvedValue({ success: true })
    const handleChange = jest.fn()

    render(
      <LikeButton
        listId="507f1f77bcf86cd799439011"
        initialIsLiked={false}
        initialLikeCount={5}
        onLikeChange={handleChange}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(true, 6)
    })
  })

  it('does not call API for invalid listId', async () => {
    render(<LikeButton listId="invalid-id" initialIsLiked={false} />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(api.social.likeList).not.toHaveBeenCalled()
    })
  })

  it('has correct aria-label', () => {
    render(
      <LikeButton
        listId="507f1f77bcf86cd799439011"
        initialIsLiked={false}
      />
    )

    expect(screen.getByLabelText('Like')).toBeInTheDocument()
  })

  it('has correct aria-label when liked', () => {
    render(
      <LikeButton
        listId="507f1f77bcf86cd799439011"
        initialIsLiked={true}
      />
    )

    expect(screen.getByLabelText('Unlike')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <LikeButton
        listId="507f1f77bcf86cd799439011"
        initialIsLiked={false}
        className="custom-class"
      />
    )

    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('count does not go below 0', async () => {
    api.social.unlikeList.mockImplementation(() => new Promise(() => {}))

    render(
      <LikeButton
        listId="507f1f77bcf86cd799439011"
        initialIsLiked={true}
        initialLikeCount={0}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    // Count should stay at 0 or not be displayed
    await waitFor(() => {
      expect(screen.queryByText('-1')).not.toBeInTheDocument()
    })
  })
})
