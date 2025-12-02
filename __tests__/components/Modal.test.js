import { render, screen, fireEvent } from '@testing-library/react'
import Modal, { ModalActions } from '@/components/ui/Modal'

describe('Modal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        Modal content
      </Modal>
    )
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        Modal content
      </Modal>
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Title">
        Content
      </Modal>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Title" description="Test description">
        Content
      </Modal>
    )
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} title="Title">
        Content
      </Modal>
    )

    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Title" showCloseButton={false}>
        Content
      </Modal>
    )
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
  })

  it('calls onClose when backdrop is clicked (when closeOnBackdrop is true)', () => {
    const handleClose = jest.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnBackdrop={true}>
        Content
      </Modal>
    )

    // Click the backdrop (the outer fixed element)
    const backdrop = document.querySelector('.bg-black\\/50')
    fireEvent.click(backdrop)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when backdrop is clicked (when closeOnBackdrop is false)', () => {
    const handleClose = jest.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnBackdrop={false}>
        Content
      </Modal>
    )

    const backdrop = document.querySelector('.bg-black\\/50')
    fireEvent.click(backdrop)
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed (when closeOnEscape is true)', () => {
    const handleClose = jest.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnEscape={true}>
        Content
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when Escape key is pressed (when closeOnEscape is false)', () => {
    const handleClose = jest.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnEscape={false}>
        Content
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('applies size classes', () => {
    const { container, rerender } = render(
      <Modal isOpen={true} onClose={() => {}} size="sm">
        Content
      </Modal>
    )
    expect(container.querySelector('.max-w-sm')).toBeInTheDocument()

    rerender(
      <Modal isOpen={true} onClose={() => {}} size="lg">
        Content
      </Modal>
    )
    expect(container.querySelector('.max-w-lg')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Accessible Modal" description="Description">
        Content
      </Modal>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')
    expect(dialog).toHaveAttribute('aria-describedby')
  })
})

describe('ModalActions', () => {
  it('renders children', () => {
    render(
      <ModalActions>
        <button>Cancel</button>
        <button>Save</button>
      </ModalActions>
    )
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })
})
