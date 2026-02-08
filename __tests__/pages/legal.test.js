import { render, screen, waitFor } from '@testing-library/react'
import PrivacyPolicy from '@/app/legal/privacy/page'
import TermsOfService from '@/app/legal/terms/page'
import AffiliateDisclosure from '@/app/legal/affiliate-disclosure/page'

// Mock the api module
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    legal: {
      getPrivacyPolicy: jest.fn(),
      getTermsOfService: jest.fn(),
      getAffiliateDisclosure: jest.fn(),
    },
  },
}))

// Mock the Header component
jest.mock('@/components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>
  }
})

import api from '@/lib/api'

const mockPrivacyContent = {
  lastUpdated: 'January 1, 2026',
  sections: [
    { title: 'Introduction', content: 'Welcome to our privacy policy.' },
    { title: 'Data Collection', content: 'We collect minimal data.' },
  ],
}

const mockTermsContent = {
  lastUpdated: 'January 1, 2026',
  sections: [
    { title: 'Acceptance', content: 'By using this service...' },
    { title: 'User Conduct', content: 'Users must behave appropriately.' },
  ],
}

const mockAffiliateContent = {
  lastUpdated: 'January 1, 2026',
  sections: [
    { title: 'Disclosure Statement', content: 'We participate in affiliate programs.' },
    { title: 'Amazon Associates', content: 'As an Amazon Associate, we earn from qualifying purchases.' },
  ],
}

describe('Privacy Policy Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    api.legal.getPrivacyPolicy.mockImplementation(() => new Promise(() => {}))
    render(<PrivacyPolicy />)

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders content when API succeeds', async () => {
    api.legal.getPrivacyPolicy.mockResolvedValue(mockPrivacyContent)
    render(<PrivacyPolicy />)

    await waitFor(() => {
      expect(screen.getByText('Introduction')).toBeInTheDocument()
    })

    expect(screen.getByText('Welcome to our privacy policy.')).toBeInTheDocument()
    expect(screen.getByText('Data Collection')).toBeInTheDocument()
    expect(screen.getByText('Last updated: January 1, 2026')).toBeInTheDocument()
  })

  it('renders error state when API fails', async () => {
    api.legal.getPrivacyPolicy.mockRejectedValue(new Error('Network error'))
    render(<PrivacyPolicy />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load privacy policy')).toBeInTheDocument()
    })

    expect(screen.getByText('Retry')).toBeInTheDocument()
  })
})

describe('Terms of Service Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    api.legal.getTermsOfService.mockImplementation(() => new Promise(() => {}))
    render(<TermsOfService />)

    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders content when API succeeds', async () => {
    api.legal.getTermsOfService.mockResolvedValue(mockTermsContent)
    render(<TermsOfService />)

    await waitFor(() => {
      expect(screen.getByText('Acceptance')).toBeInTheDocument()
    })

    expect(screen.getByText('By using this service...')).toBeInTheDocument()
    expect(screen.getByText('User Conduct')).toBeInTheDocument()
    expect(screen.getByText('Last updated: January 1, 2026')).toBeInTheDocument()
  })

  it('renders error state when API fails', async () => {
    api.legal.getTermsOfService.mockRejectedValue(new Error('Network error'))
    render(<TermsOfService />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load terms of service')).toBeInTheDocument()
    })

    expect(screen.getByText('Retry')).toBeInTheDocument()
  })
})

describe('Affiliate Disclosure Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    api.legal.getAffiliateDisclosure.mockImplementation(() => new Promise(() => {}))
    render(<AffiliateDisclosure />)

    expect(screen.getByText('Affiliate Disclosure')).toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders content when API succeeds', async () => {
    api.legal.getAffiliateDisclosure.mockResolvedValue(mockAffiliateContent)
    render(<AffiliateDisclosure />)

    await waitFor(() => {
      expect(screen.getByText('Disclosure Statement')).toBeInTheDocument()
    })

    expect(screen.getByText('We participate in affiliate programs.')).toBeInTheDocument()
    expect(screen.getByText('Amazon Associates')).toBeInTheDocument()
    expect(screen.getByText('Last updated: January 1, 2026')).toBeInTheDocument()
  })

  it('renders error state when API fails', async () => {
    api.legal.getAffiliateDisclosure.mockRejectedValue(new Error('Network error'))
    render(<AffiliateDisclosure />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load affiliate disclosure')).toBeInTheDocument()
    })

    expect(screen.getByText('Retry')).toBeInTheDocument()
  })
})
