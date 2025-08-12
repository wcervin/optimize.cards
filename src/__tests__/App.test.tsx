import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('Points Strategy Planner')).toBeInTheDocument()
  })

  it('renders the main description', () => {
    render(<App />)
    expect(screen.getByText(/Select your cards, airline networks/)).toBeInTheDocument()
  })

  it('renders the PointsStrategyPlanner component', () => {
    render(<App />)
    // Check for elements that are specific to PointsStrategyPlanner
    expect(screen.getByText('Card(s)')).toBeInTheDocument()
    expect(screen.getByText('Preferred Airline(s) / Network')).toBeInTheDocument()
  })
})
