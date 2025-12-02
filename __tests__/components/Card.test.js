import { render, screen, fireEvent } from '@testing-library/react'
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    const { rerender, container } = render(<Card variant="default">Default</Card>)
    expect(container.firstChild).toHaveClass('shadow-md')

    rerender(<Card variant="flat">Flat</Card>)
    expect(container.firstChild).toHaveClass('border')

    rerender(<Card variant="elevated">Elevated</Card>)
    expect(container.firstChild).toHaveClass('shadow-lg')
  })

  it('applies hover styles when hover is true', () => {
    const { container } = render(<Card hover>Hoverable</Card>)
    expect(container.firstChild).toHaveClass('hover:shadow-lg')
  })

  it('applies padding styles', () => {
    const { container, rerender } = render(<Card padding="sm">Small</Card>)
    expect(container.firstChild).toHaveClass('p-3')

    rerender(<Card padding="lg">Large</Card>)
    expect(container.firstChild).toHaveClass('p-6')

    rerender(<Card padding="none">None</Card>)
    expect(container.firstChild).not.toHaveClass('p-3')
    expect(container.firstChild).not.toHaveClass('p-4')
    expect(container.firstChild).not.toHaveClass('p-6')
  })

  it('handles click events when onClick is provided', () => {
    const handleClick = jest.fn()
    render(<Card onClick={handleClick}>Clickable</Card>)

    fireEvent.click(screen.getByText('Clickable'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('has button role when clickable', () => {
    render(<Card onClick={() => {}}>Clickable</Card>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('accepts custom className', () => {
    const { container } = render(<Card className="custom-class">Custom</Card>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header content</CardHeader>)
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })
})

describe('CardTitle', () => {
  it('renders as heading', () => {
    render(<CardTitle>Card Title</CardTitle>)
    expect(screen.getByRole('heading', { name: /card title/i })).toBeInTheDocument()
  })
})

describe('CardDescription', () => {
  it('renders description text', () => {
    render(<CardDescription>Description text</CardDescription>)
    expect(screen.getByText('Description text')).toBeInTheDocument()
  })
})

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Content area</CardContent>)
    expect(screen.getByText('Content area')).toBeInTheDocument()
  })
})

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer content</CardFooter>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })
})
