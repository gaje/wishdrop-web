import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import EditItemModal from '@/components/EditItemModal'
import api from '@/lib/api'

// Mock the API module
jest.mock('@/lib/api', () => ({
  items: {
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockItem = {
  _id: 'item-123',
  title: 'Test Product',
  url: 'https://example.com/product',
  price: { amount: 29.99, currency: 'USD' },
  notes: 'Size medium',
  priority: 'high',
  imageUrl: 'https://example.com/image.jpg',
}

describe('EditItemModal', () => {
  const mockOnClose = jest.fn()
  const mockOnItemUpdated = jest.fn()
  const mockOnItemDeleted = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open with item', () => {
    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Edit Item' })).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <EditItemModal
        isOpen={false}
        onClose={mockOnClose}
        item={mockItem}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not render when no item', () => {
    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={null}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('populates form with item data', () => {
    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )

    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://example.com/product')).toBeInTheDocument()
    expect(screen.getByDisplayValue('29.99')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Size medium')).toBeInTheDocument()
  })

  it('shows item image preview', () => {
    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )

    const img = screen.getByAltText('Test Product')
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  it('selects correct priority', () => {
    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )

    const highButton = screen.getByText('High')
    expect(highButton).toHaveClass('bg-red-500')
  })

  it('does not call api.items.update with empty title', async () => {
    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )

    const titleInput = screen.getByDisplayValue('Test Product')
    fireEvent.change(titleInput, { target: { value: '   ' } })

    // Try to submit
    const submitButton = screen.getByRole('button', { name: 'Save Changes' })
    fireEvent.click(submitButton)

    // Give time for potential API call
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    // API should NOT have been called because title is empty
    expect(api.items.update).not.toHaveBeenCalled()
  })

  it('updates item successfully', async () => {
    api.items.update.mockResolvedValue({ _id: 'item-123' })

    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )

    const titleInput = screen.getByDisplayValue('Test Product')
    fireEvent.change(titleInput, { target: { value: 'Updated Product' } })

    fireEvent.click(screen.getByText('Save Changes'))

    await waitFor(() => {
      expect(api.items.update).toHaveBeenCalledWith(
        'item-123',
        expect.objectContaining({
          title: 'Updated Product',
        })
      )
    })

    expect(mockOnItemUpdated).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows error on update failure', async () => {
    const error = new Error('Network error')
    error.getUserMessage = () => 'Failed to update item. Please try again.'
    api.items.update.mockRejectedValue(error)

    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )

    fireEvent.click(screen.getByText('Save Changes'))

    await waitFor(() => {
      expect(screen.getByText('Failed to update item. Please try again.')).toBeInTheDocument()
    })
  })

  it('calls onClose when cancel clicked', () => {
    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows delete confirmation when Delete Item clicked', () => {
    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )

    fireEvent.click(screen.getByText('Delete Item'))

    expect(screen.getByText('Delete this item?')).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to delete "Test Product"/)).toBeInTheDocument()
  })

  it('cancels delete and returns to form', () => {
    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )

    fireEvent.click(screen.getByText('Delete Item'))
    expect(screen.getByText('Delete this item?')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByText('Delete this item?')).not.toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument()
  })

  it('deletes item successfully', async () => {
    api.items.delete.mockResolvedValue({})

    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )

    fireEvent.click(screen.getByText('Delete Item'))
    fireEvent.click(screen.getByRole('button', { name: 'Delete Item' }))

    await waitFor(() => {
      expect(api.items.delete).toHaveBeenCalledWith('item-123')
    })

    expect(mockOnItemDeleted).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows error on delete failure', async () => {
    const error = new Error('Network error')
    error.getUserMessage = () => 'Failed to delete item. Please try again.'
    api.items.delete.mockRejectedValue(error)

    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )

    fireEvent.click(screen.getByText('Delete Item'))
    fireEvent.click(screen.getByRole('button', { name: 'Delete Item' }))

    await waitFor(() => {
      expect(screen.getByText('Failed to delete item. Please try again.')).toBeInTheDocument()
    })
  })

  it('changes priority', () => {
    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )

    const lowButton = screen.getByText('Low')
    fireEvent.click(lowButton)
    expect(lowButton).toHaveClass('bg-gray-400')
  })

  it('updates notes', () => {
    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )

    const notesInput = screen.getByDisplayValue('Size medium')
    fireEvent.change(notesInput, { target: { value: 'Size large, red color' } })
    expect(screen.getByDisplayValue('Size large, red color')).toBeInTheDocument()
  })

  it('handles item without price', () => {
    const itemWithoutPrice = { ...mockItem, price: null }
    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={itemWithoutPrice}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )

    const priceInput = screen.getByPlaceholderText('29.99')
    expect(priceInput).toHaveValue(null)
  })

  it('handles item without image', () => {
    const itemWithoutImage = { ...mockItem, imageUrl: null }
    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={itemWithoutImage}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )

    expect(screen.queryByAltText('Test Product')).not.toBeInTheDocument()
  })

  it('submits with null price when cleared', async () => {
    api.items.update.mockResolvedValue({})

    render(
      <EditItemModal
        isOpen={true}
        onClose={mockOnClose}
        item={mockItem}
        onItemUpdated={mockOnItemUpdated}
        onItemDeleted={mockOnItemDeleted}
      />
    )

    const priceInput = screen.getByDisplayValue('29.99')
    fireEvent.change(priceInput, { target: { value: '' } })

    fireEvent.click(screen.getByText('Save Changes'))

    await waitFor(() => {
      expect(api.items.update).toHaveBeenCalledWith(
        'item-123',
        expect.objectContaining({
          price: null,
        })
      )
    })
  })
})
