import { NavLink } from "react-router-dom";
import { FileSpreadsheet } from "lucide-react";

const cls = ({ isActive }: { isActive: boolean }) =>
  isActive ? "nav-link active" : "nav-link";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <span className="brand-icon">
            <FileSpreadsheet size={18} />
          </span>
          <span>CV Declaration Generator</span>
        </div>
        <nav className="nav">
          <NavLink to="/" end className={cls}>
            Tableau de bord
          </NavLink>
          <NavLink to="/upload" className={cls}>
            Import
          </NavLink>
          <NavLink to="/declaration" className={cls}>
            Déclaration
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
