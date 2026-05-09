import './PlayerAvatar.css';

function PlayerAvatar({ player, size = 28 }) {
  const name = player?.nickname || player?.name || '?';

  if (player?.avatarUrl) {
    return (
      <img
        src={player.avatarUrl}
        alt={name}
        className="player-avatar-component"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="player-avatar-placeholder-component"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default PlayerAvatar;
