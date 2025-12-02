import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import AddItemModal from '@/components/AddItemModal'
import api from '@/lib/api'

// Mock the API module
jest.mock('@/lib/api', () => ({
  metadata: {
    fetch: jest.fn(),
  },
  items: {
    create: jest.fn(),
  },
}))

describe('AddItemModal', () => {
  const mockOnClose = jest.fn()
  const mockOnItemAdded = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Add Item' })).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <AddItemModal
        isOpen={false}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders URL input field', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )
    expect(screen.getByPlaceholderText('https://example.com/product')).toBeInTheDocument()
  })

  it('renders item name field', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )
    expect(screen.getByPlaceholderText('e.g., Blue Wireless Headphones')).toBeInTheDocument()
  })

  it('renders price field', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )
    expect(screen.getByPlaceholderText('29.99')).toBeInTheDocument()
  })

  it('renders priority buttons', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('renders notes textarea', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )
    expect(screen.getByPlaceholderText('Any additional details (size, color, etc.)')).toBeInTheDocument()
  })

  it('has required indicator on title input', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )

    // The Item Name field should have a required indicator
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('does not call api.items.create without title', async () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )

    // Just fill in a URL but not a title
    const urlInput = screen.getByPlaceholderText('https://example.com/product')
    fireEvent.change(urlInput, { target: { value: 'https://example.com/product' } })

    // Try to submit - the API should NOT be called because title is empty
    const submitButton = screen.getByRole('button', { name: 'Add Item' })
    fireEvent.click(submitButton)

    // Give time for potential API call
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    // API should NOT have been called
    expect(api.items.create).not.toHaveBeenCalled()
  })

  it('calls onClose when cancel clicked', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('changes priority when button clicked', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )

    const highButton = screen.getByText('High')
    fireEvent.click(highButton)
    expect(highButton).toHaveClass('bg-red-500')
  })

  it('fetches metadata when URL entered', async () => {
    jest.useFakeTimers()
    api.metadata.fetch.mockResolvedValue({
      title: 'Fetched Product Title',
      price: 49.99,
      image: 'https://example.com/image.jpg',
    })

    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )

    const urlInput = screen.getByPlaceholderText('https://example.com/product')
    fireEvent.change(urlInput, { target: { value: 'https://amazon.com/product' } })

    // Fast-forward the debounce timer
    act(() => {
      jest.advanceTimersByTime(500)
    })

    await waitFor(() => {
      expect(api.metadata.fetch).toHaveBeenCalledWith('https://amazon.com/product')
    })
    jest.useRealTimers()
  })

  it('auto-fills title from metadata', async () => {
    jest.useFakeTimers()
    api.metadata.fetch.mockResolvedValue({
      title: 'Fetched Product Title',
      price: 49.99,
      image: 'https://example.com/image.jpg',
    })

    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )

    const urlInput = screen.getByPlaceholderText('https://example.com/product')
    fireEvent.change(urlInput, { target: { value: 'https://amazon.com/product' } })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    await waitFor(() => {
      expect(screen.getByDisplayValue('Fetched Product Title')).toBeInTheDocument()
    })
    jest.useRealTimers()
  })

  it('submits item successfully', async () => {
    api.items.create.mockResolvedValue({ _id: 'new-item-123' })

    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )

    // Fill in the title
    const titleInput = screen.getByPlaceholderText('e.g., Blue Wireless Headphones')
    fireEvent.change(titleInput, { target: { value: 'My New Item' } })

    // Fill in price
    const priceInput = screen.getByPlaceholderText('29.99')
    fireEvent.change(priceInput, { target: { value: '19.99' } })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }))

    await waitFor(() => {
      expect(api.items.create).toHaveBeenCalledWith(
        expect.objectContaining({
          listId: 'list-123',
          title: 'My New Item',
          priority: 'medium',
          price: { amount: 19.99, currency: 'USD' },
        })
      )
    })

    expect(mockOnItemAdded).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows error on submission failure', async () => {
    const error = new Error('Network error')
    error.getUserMessage = () => 'Failed to add item. Please try again.'
    api.items.create.mockRejectedValue(error)

    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )

    const titleInput = screen.getByPlaceholderText('e.g., Blue Wireless Headphones')
    fireEvent.change(titleInput, { target: { value: 'My New Item' } })

    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }))

    await waitFor(() => {
      expect(screen.getByText('Failed to add item. Please try again.')).toBeInTheDocument()
    })
  })

  it('resets form when modal closes', async () => {
    const { rerender } = render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )

    const titleInput = screen.getByPlaceholderText('e.g., Blue Wireless Headphones')
    fireEvent.change(titleInput, { target: { value: 'My New Item' } })

    // Close and reopen modal
    rerender(
      <AddItemModal
        isOpen={false}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )

    rerender(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )

    expect(screen.getByPlaceholderText('e.g., Blue Wireless Headphones')).toHaveValue('')
  })

  it('shows preview image when metadata returns image', async () => {
    jest.useFakeTimers()
    api.metadata.fetch.mockResolvedValue({
      title: 'Product',
      image: 'https://example.com/preview.jpg',
    })

    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )

    const urlInput = screen.getByPlaceholderText('https://example.com/product')
    fireEvent.change(urlInput, { target: { value: 'https://amazon.com/product' } })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    await waitFor(() => {
      const img = screen.getByAltText('Product preview')
      expect(img).toHaveAttribute('src', 'https://example.com/preview.jpg')
    })
    jest.useRealTimers()
  })

  it('does not fetch metadata for invalid URLs', async () => {
    jest.useFakeTimers()
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        listId="list-123"
        onItemAdded={mockOnItemAdded}
      />
    )

    const urlInput = screen.getByPlaceholderText('https://example.com/product')
    fireEvent.change(urlInput, { target: { value: 'not-a-url' } })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(api.metadata.fetch).not.toHaveBeenCalled()
    jest.useRealTimers()
  })
})
