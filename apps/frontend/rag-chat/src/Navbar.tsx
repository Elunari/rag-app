import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const NavLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const theme = useTheme();
  const isActive =
    location.pathname === to ||
    (to === "/chats" && location.pathname.startsWith("/chats/"));

  return (
    <Link
      to={to}
      style={{
        color: theme.palette.primary.main,
        textDecoration: "none",
        marginRight: "1rem",
        padding: "0.5rem 0",
        position: "relative",
        opacity: isActive ? 1 : 0.8,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.opacity = "0.8";
        }
      }}
    >
      {children}
      {isActive && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: theme.palette.primary.main,
            transition: "all 0.2s ease",
          }}
        />
      )}
    </Link>
  );
};

export const Navbar = () => {
  const theme = useTheme();

  return (
    <nav
      style={{
        marginBottom: "1rem",
        padding: "1rem",
        background: theme.palette.background.paper,
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <NavLink to="/">Home</NavLink>
      <NavLink to="/chats">Chats</NavLink>
    </nav>
  );
};
