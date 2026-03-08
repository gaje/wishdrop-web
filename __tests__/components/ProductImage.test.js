import { render, screen, fireEvent } from '@testing-library/react'
import ProductImage from '@/components/ui/ProductImage'

describe('ProductImage', () => {
  it('renders fallback immediately when no src provided', () => {
    render(<ProductImage src={null} alt="Test" />)
    expect(screen.getByText('Image unavailable')).toBeInTheDocument()
  })

  it('renders an img tag when src is provided', () => {
    render(<ProductImage src="https://example.com/img.jpg" alt="Test" />)
    expect(screen.getByAltText('Test')).toBeInTheDocument()
  })

  it('shows fallback on image error', () => {
    render(<ProductImage src="https://example.com/bad.jpg" alt="Test" />)
    const img = screen.getByAltText('Test')
    fireEvent.error(img)
    expect(screen.getByText('Image unavailable')).toBeInTheDocument()
  })

  it('shows fallback when image loads with tiny dimensions (bot blocker)', () => {
    render(<ProductImage src="https://example.com/bot.jpg" alt="Test" />)
    const img = screen.getByAltText('Test')
    Object.defineProperty(img, 'naturalWidth', { value: 1 })
    Object.defineProperty(img, 'naturalHeight', { value: 1 })
    fireEvent.load(img)
    expect(screen.getByText('Image unavailable')).toBeInTheDocument()
  })

  it('shows fallback for known junk image URLs (Amazon logo)', () => {
    render(<ProductImage src="https://m.media-amazon.com/images/G/01/amazon_logo.png" alt="Test" />)
    expect(screen.getByText('Image unavailable')).toBeInTheDocument()
  })

  it('keeps image when it loads with normal dimensions', () => {
    render(<ProductImage src="https://example.com/good.jpg" alt="Test" />)
    const img = screen.getByAltText('Test')
    Object.defineProperty(img, 'naturalWidth', { value: 400 })
    Object.defineProperty(img, 'naturalHeight', { value: 400 })
    fireEvent.load(img)
    expect(screen.queryByText('Image unavailable')).not.toBeInTheDocument()
    expect(screen.getByAltText('Test')).toBeInTheDocument()
  })
})
