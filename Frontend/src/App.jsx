import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PlayersPage from './pages/PlayersPage';
import LocationsPage from './pages/LocationsPage';
import MatchesPage from './pages/MatchesPage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import StatsPage from './pages/StatsPage';
import './App.css';

function App() {
  return (
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
      </div>
    </Router>
  );
}

export default App;

