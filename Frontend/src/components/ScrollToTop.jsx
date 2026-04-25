import { useWindowScroll } from '@mantine/hooks';
import './ScrollToTop.css';

function ScrollToTop() {
  const [scroll, scrollTo] = useWindowScroll();

  if (scroll.y < 300) return null;

  return (
    <button
      className="scroll-to-top"
      onClick={() => scrollTo({ y: 0 })}
      aria-label="Volver arriba"
    >
      ↑
    </button>
  );
}

export default ScrollToTop;
