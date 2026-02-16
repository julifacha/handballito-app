import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-container">
        <h1>Handballito Time</h1>
        <p className="subtitle">Gestiona tus partidos de handball, jugadores y canchas</p>
        
        <div className="feature-cards">
          <Link to="/players" className="feature-card">
            <div className="card-icon">👥</div>
            <h2>Jugadores</h2>
            <p>Gestiona los jugadores de tu equipo. Agrega, visualiza y organiza la información de los jugadores.</p>
          </Link>

          <Link to="/locations" className="feature-card">
            <div className="card-icon">📍</div>
            <h2>Canchas</h2>
            <p>Gestiona las canchas. Agrega y organiza los lugares para tus partidos.</p>
          </Link>

          <Link to="/matches" className="feature-card">
            <div className="card-icon">⚽</div>
            <h2>Partidos</h2>
            <p>Crea y gestiona partidos. Programa juegos, asigna equipos y selecciona canchas.</p>
          </Link>

          <Link to="/leaderboard" className="feature-card">
            <div className="card-icon">🏆</div>
            <h2>Leaderboard</h2>
            <p>Rankings de jugadores. Mas partidos, mas victorias, mejor porcentaje y rachas actuales.</p>
          </Link>

          <Link to="/stats" className="feature-card">
            <div className="card-icon">📊</div>
            <h2>Estadisticas</h2>
            <p>Graficos y datos agregados. Mejores duplas, partidos por mes y por cancha.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

