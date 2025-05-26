import { Link, useLocation } from "react-router-dom";
import { Box, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";

const NavLink = ({
  to,
  children,
  isActive,
}: {
  to: string;
  children: React.ReactNode;
  isActive: boolean;
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: theme.palette.text.primary,
        opacity: isActive || isHovered ? 1 : 0.7,
        transition: "opacity 0.2s ease-in-out",
        position: "relative",
        padding: "0.5rem 1rem",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {(isActive || isHovered) && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: theme.palette.primary.main,
            transform: "scaleX(1)",
            transition: "transform 0.2s ease-in-out",
            opacity: isActive ? 1 : 0.5,
          }}
        />
      )}
    </Link>
  );
};

export const Navbar = () => {
  const theme = useTheme();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/chats") {
      return location.pathname.startsWith("/chat");
    }
    return location.pathname === path;
  };

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: theme.palette.background.paper,
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        px: 2,
        py: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box sx={{ display: "flex", gap: 4, alignItems: "center" }}>
        <NavLink to="/" isActive={isActive("/")}>
          Home
        </NavLink>
        <NavLink to="/chats" isActive={isActive("/chats")}>
          Chats
        </NavLink>
        <NavLink to="/add-knowledge" isActive={isActive("/add-knowledge")}>
          Add Knowledge
        </NavLink>
      </Box>
    </Box>
  );
};
