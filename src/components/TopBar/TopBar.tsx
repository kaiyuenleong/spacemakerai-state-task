import logo from '../../static/logo_white.png';
import './styles.css';

interface TopBarProps {}

/**
 * Component for horizontal bar at the top of the page
 * @version 1.0.0
 */
function TopBar(props: TopBarProps) {
  return (
    <div className="topbar flex align_center">
      <img src={logo} alt="Logo with link to Spacemaker's website" />
    </div>
  )
}

export { TopBar };
