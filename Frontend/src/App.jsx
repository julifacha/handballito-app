import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import LandingPage from './pages/LandingPage';
import PlayersPage from './pages/PlayersPage';
import LocationsPage from './pages/LocationsPage';
import MatchesPage from './pages/MatchesPage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import StatsPage from './pages/StatsPage';
import ScrollToTop from './components/ScrollToTop';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './App.css';

function App() {
  return (
    <MantineProvider defaultColorScheme="auto">
      <Notifications position="bottom-right" />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/players/:id" element={<PlayerDetailPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
          <ScrollToTop />
        </div>
      </Router>
    </MantineProvider>
  );
}

export default App;

