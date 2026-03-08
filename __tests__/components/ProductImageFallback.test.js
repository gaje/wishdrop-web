import { render, screen } from '@testing-library/react'
import ProductImageFallback from '@/components/ui/ProductImageFallback'

describe('ProductImageFallback', () => {
  it('renders the fallback with "Image unavailable" text', () => {
    render(<ProductImageFallback />)
    expect(screen.getByText('Image unavailable')).toBeInTheDocument()
  })

  it('renders "Tap to view on store" subtext', () => {
    render(<ProductImageFallback />)
    expect(screen.getByText('Tap to view on store')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<ProductImageFallback className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
