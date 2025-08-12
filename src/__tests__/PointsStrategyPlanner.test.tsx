import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PointsStrategyPlanner from '../PointsStrategyPlanner'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('PointsStrategyPlanner', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockClear()
  })

  it('renders the main title', () => {
    render(<PointsStrategyPlanner />)
    expect(screen.getByText('Points Strategy Planner')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<PointsStrategyPlanner />)
    expect(screen.getByText(/Select your cards, airline networks/)).toBeInTheDocument()
  })

  it('renders card selection section', () => {
    render(<PointsStrategyPlanner />)
    expect(screen.getByText('Card(s)')).toBeInTheDocument()
  })

  it('renders airline preferences section', () => {
    render(<PointsStrategyPlanner />)
    expect(screen.getByText('Preferred Airline(s) / Network')).toBeInTheDocument()
  })

  it('renders hotel preferences section', () => {
    render(<PointsStrategyPlanner />)
    expect(screen.getByText('Preferred Hotel Program(s)')).toBeInTheDocument()
  })

  it('renders airport selection section', () => {
    render(<PointsStrategyPlanner />)
    expect(screen.getByText('Preferred Home Airport (IATA)')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<PointsStrategyPlanner />)
    expect(screen.getByText('Run Rules Engine')).toBeInTheDocument()
    expect(screen.getByText('Export JSON')).toBeInTheDocument()
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
    expect(screen.getByText('Reset Defaults')).toBeInTheDocument()
  })

  it('shows default selected cards', () => {
    render(<PointsStrategyPlanner />)
    expect(screen.getByText('Capital One Venture')).toBeInTheDocument()
    expect(screen.getByText('Amex Platinum (Personal)')).toBeInTheDocument()
    expect(screen.getByText('Amex Hilton Honors Aspire')).toBeInTheDocument()
    expect(screen.getByText('Chase Ink Preferred')).toBeInTheDocument()
  })

  it('shows default airline preferences', () => {
    render(<PointsStrategyPlanner />)
    expect(screen.getByText('oneworld')).toBeInTheDocument()
    expect(screen.getByText('British Airways (Avios)')).toBeInTheDocument()
    expect(screen.getByText('Iberia (Avios)')).toBeInTheDocument()
    expect(screen.getByText('Qatar (Avios)')).toBeInTheDocument()
  })

  it('shows default hotel preferences', () => {
    render(<PointsStrategyPlanner />)
    // Use getAllByText to handle multiple instances
    const marriottElements = screen.getAllByText('Marriott Bonvoy')
    expect(marriottElements.length).toBeGreaterThan(0)
    
    const hiltonElements = screen.getAllByText('Hilton Honors')
    expect(hiltonElements.length).toBeGreaterThan(0)
    
    const hyattElements = screen.getAllByText('World of Hyatt')
    expect(hyattElements.length).toBeGreaterThan(0)
  })

  it('shows default airport', () => {
    render(<PointsStrategyPlanner />)
    const airportInput = screen.getByDisplayValue('DFW')
    expect(airportInput).toBeInTheDocument()
  })

  it('generates strategy plan when components are selected', () => {
    render(<PointsStrategyPlanner />)
    expect(screen.getByText('Optimized Strategy Plan')).toBeInTheDocument()
  })
})
