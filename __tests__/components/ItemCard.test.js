import { render, screen, fireEvent } from '@testing-library/react'
import ItemCard from '@/components/ItemCard'

const mockItem = {
  _id: 'item-123',
  title: 'Test Product',
  price: { amount: 29.99, currency: 'USD' },
  notes: 'Size medium, blue color',
  url: 'https://example.com/product',
  imageUrl: 'https://example.com/image.jpg',
  priority: 'high',
  merchant: 'Example Store',
  claimedBy: null,
}

describe('ItemCard', () => {
  it('renders item title', () => {
    render(<ItemCard item={mockItem} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('renders formatted price', () => {
    render(<ItemCard item={mockItem} />)
    expect(screen.getByText('$29.99')).toBeInTheDocument()
  })

  it('renders price unavailable when no price', () => {
    const itemWithoutPrice = { ...mockItem, price: null }
    render(<ItemCard item={itemWithoutPrice} />)
    expect(screen.getByText('Price unavailable')).toBeInTheDocument()
  })

  it('renders merchant name', () => {
    render(<ItemCard item={mockItem} />)
    expect(screen.getByText('Example Store')).toBeInTheDocument()
  })

  it('renders notes', () => {
    render(<ItemCard item={mockItem} />)
    expect(screen.getByText('Size medium, blue color')).toBeInTheDocument()
  })

  it('renders priority badge for high priority', () => {
    render(<ItemCard item={mockItem} />)
    expect(screen.getByText('High Priority')).toBeInTheDocument()
  })

  it('renders priority badge for medium priority', () => {
    const mediumItem = { ...mockItem, priority: 'medium' }
    render(<ItemCard item={mediumItem} />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('renders priority badge for low priority', () => {
    const lowItem = { ...mockItem, priority: 'low' }
    render(<ItemCard item={lowItem} />)
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('renders View Item link when URL provided', () => {
    render(<ItemCard item={mockItem} />)
    const link = screen.getByRole('link', { name: 'View Item' })
    expect(link).toHaveAttribute('href', 'https://example.com/product')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('does not render View Item when no URL', () => {
    const itemWithoutUrl = { ...mockItem, url: null }
    render(<ItemCard item={itemWithoutUrl} />)
    expect(screen.queryByRole('link', { name: 'View Item' })).not.toBeInTheDocument()
  })

  it('shows claimed badge when item is claimed', () => {
    const claimedItem = {
      ...mockItem,
      claimedBy: { _id: 'user-456', username: 'testuser' },
    }
    render(<ItemCard item={claimedItem} />)
    expect(screen.getByText('Claimed')).toBeInTheDocument()
  })

  it('shows "Claimed by you" when claimed by current user', () => {
    const claimedItem = {
      ...mockItem,
      claimedBy: { _id: 'user-456', username: 'testuser' },
    }
    render(<ItemCard item={claimedItem} currentUserId="user-456" />)
    expect(screen.getByText('Claimed by you')).toBeInTheDocument()
  })

  it('shows "Someone\'s got it!" for owner viewing claimed item', () => {
    const claimedItem = {
      ...mockItem,
      claimedBy: { _id: 'user-456', username: 'testuser' },
    }
    render(<ItemCard item={claimedItem} isOwner={true} />)
    expect(screen.getByText("Someone's got it!")).toBeInTheDocument()
  })

  it('calls onEdit when edit button clicked by owner', () => {
    const handleEdit = jest.fn()
    render(<ItemCard item={mockItem} isOwner={true} onEdit={handleEdit} />)

    fireEvent.click(screen.getByText('Edit Item'))
    expect(handleEdit).toHaveBeenCalledWith(mockItem)
  })

  it('shows Delete button for owner', () => {
    const handleDelete = jest.fn()
    render(<ItemCard item={mockItem} isOwner={true} onDelete={handleDelete} />)
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls onDelete when delete button clicked', () => {
    const handleDelete = jest.fn()
    render(<ItemCard item={mockItem} isOwner={true} onDelete={handleDelete} />)

    fireEvent.click(screen.getByText('Delete'))
    expect(handleDelete).toHaveBeenCalledWith('item-123')
  })

  it('shows Claim button for logged in non-owner on unclaimed item when connected', () => {
    render(<ItemCard item={mockItem} isOwner={false} currentUserId="user-789" connectionStatus="connected" />)
    expect(screen.getByText('Claim This')).toBeInTheDocument()
  })

  it('shows Connect button when not connected', () => {
    const handleConnect = jest.fn()
    render(
      <ItemCard
        item={mockItem}
        isOwner={false}
        currentUserId="user-789"
        connectionStatus={null}
        onConnect={handleConnect}
      />
    )
    expect(screen.getByText('Connect to Claim')).toBeInTheDocument()
  })

  it('calls onClaim when claim button clicked', () => {
    const handleClaim = jest.fn()
    render(
      <ItemCard
        item={mockItem}
        isOwner={false}
        currentUserId="user-789"
        connectionStatus="connected"
        onClaim={handleClaim}
      />
    )

    fireEvent.click(screen.getByText('Claim This'))
    expect(handleClaim).toHaveBeenCalledWith('item-123')
  })

  it('shows Unclaim button for user who claimed item', () => {
    const claimedItem = {
      ...mockItem,
      claimedBy: { _id: 'user-789', username: 'claimer' },
    }
    render(<ItemCard item={claimedItem} currentUserId="user-789" />)
    expect(screen.getByText('Unclaim')).toBeInTheDocument()
  })

  it('calls onUnclaim when unclaim button clicked', () => {
    const handleUnclaim = jest.fn()
    const claimedItem = {
      ...mockItem,
      claimedBy: { _id: 'user-789', username: 'claimer' },
    }
    render(
      <ItemCard
        item={claimedItem}
        currentUserId="user-789"
        onUnclaim={handleUnclaim}
      />
    )

    fireEvent.click(screen.getByText('Unclaim'))
    expect(handleUnclaim).toHaveBeenCalledWith('item-123')
  })

  it('does not show Claim button for guest users', () => {
    render(<ItemCard item={mockItem} isOwner={false} currentUserId={null} />)
    expect(screen.queryByText('Claim This')).not.toBeInTheDocument()
  })

  it('hides actions when showActions is false', () => {
    render(<ItemCard item={mockItem} showActions={false} />)
    expect(screen.queryByRole('link', { name: 'View Item' })).not.toBeInTheDocument()
  })

  it('renders product image', () => {
    render(<ItemCard item={mockItem} />)
    const img = screen.getByAltText('Test Product')
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  it('shows placeholder when no image', () => {
    const itemWithoutImage = { ...mockItem, imageUrl: null }
    const { container } = render(<ItemCard item={itemWithoutImage} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
