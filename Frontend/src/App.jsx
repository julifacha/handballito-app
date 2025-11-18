import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PlayersPage from './pages/PlayersPage';
import LocationsPage from './pages/LocationsPage';
import MatchesPage from './pages/MatchesPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/matches" element={<MatchesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

