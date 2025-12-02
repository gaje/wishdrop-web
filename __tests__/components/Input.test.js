import { render, screen, fireEvent } from '@testing-library/react'
import Input from '@/components/ui/Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders required indicator', () => {
    render(<Input label="Email" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('displays placeholder text', () => {
    render(<Input placeholder="Enter your email" />)
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
  })

  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Input value="" onChange={handleChange} />)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('displays error message', () => {
    render(<Input error="Email is required" />)
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('displays helper text', () => {
    render(<Input helperText="We will never share your email" />)
    expect(screen.getByText('We will never share your email')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('applies error styles when error is present', () => {
    render(<Input error="Invalid" />)
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500')
  })

  it('renders with icon on left', () => {
    render(<Input icon={<span data-testid="icon">@</span>} iconPosition="left" />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders with icon on right', () => {
    render(<Input icon={<span data-testid="icon">X</span>} iconPosition="right" />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('accepts custom className', () => {
    render(<Input className="custom-wrapper" />)
    const wrapper = screen.getByRole('textbox').closest('.custom-wrapper')
    expect(wrapper).toBeInTheDocument()
  })

  it('supports different input types', () => {
    const { container } = render(<Input type="password" />)
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
  })
})
