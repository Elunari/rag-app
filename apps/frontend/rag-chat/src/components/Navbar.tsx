import { Link, useLocation, useNavigate } from "react-router-dom";
import { Box, Button, useTheme } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState } from "react";

interface NavbarProps {
  onLogout: () => Promise<void>;
}

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

export const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/chats") {
      return location.pathname.startsWith("/chat");
    }
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await onLogout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{
          borderColor: "rgba(255, 255, 255, 0.2)",
          "&:hover": {
            borderColor: "rgba(255, 255, 255, 0.4)",
            background: "rgba(255, 255, 255, 0.05)",
          },
        }}
      >
        Logout
      </Button>
    </Box>
  );
};
