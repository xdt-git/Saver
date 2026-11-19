import { NavButton } from "./nav-button";
import logo from "@/shared/assets/logo.webp";
import { FaUser } from "react-icons/fa";
import "./header.scss";

const navItems = [
    { label: "Начальная страница", to: "/" },
    { label: "Случайный контент", to: "/discover" },
    { label: "Основная страница", to: "/Save" },
];

export const Header = () => {
    return (
        <header>
            <div className="logo">
                <img alt="Company Logo" src={logo} />
            </div>
            <nav>
                {navItems.map((item) => (
                    <NavButton key={item.to} label={item.label} move={item.to} />
                ))}
            </nav>
            <div className="glow-text">
                <FaUser style={{ fontSize: "48px" }} />
            </div>
        </header>
    );
};
