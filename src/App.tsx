import React from 'react';
import PointsStrategyPlanner from './PointsStrategyPlanner';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <div className="container">
        <PointsStrategyPlanner />
      </div>
    </ErrorBoundary>
  );
}
