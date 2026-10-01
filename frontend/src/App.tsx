import { lazy, Suspense } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const TestCases = lazy(() => import('./pages/TestCases'));
const Results = lazy(() => import('./pages/Results'));
const ResponseQuality = lazy(() => import('./pages/ResponseQuality'));
const FailureAnalysis = lazy(() => import('./pages/FailureAnalysis'));
const Evaluate = lazy(() => import('./pages/Evaluate'));
const About = lazy(() => import('./pages/About'));

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="app-loading" role="status">
          Loading evaluation dashboard…
        </div>
      }
    >
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="test-cases" element={<TestCases />} />
          <Route path="results" element={<Results />} />
          <Route path="response-quality" element={<ResponseQuality />} />
          <Route path="failure-analysis" element={<FailureAnalysis />} />
          <Route path="evaluate" element={<Evaluate />} />
          <Route path="about" element={<About />} />
          <Route
            path="*"
            element={
              <div className="empty-state">
                <h1>Page not found</h1>
                <p>This page is not part of the evaluation dashboard.</p>
                <Link className="button button-primary" to="/">
                  Return to Dashboard
                </Link>
              </div>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
