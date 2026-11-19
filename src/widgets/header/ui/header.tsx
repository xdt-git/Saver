import { NavButton } from "./nav-button";
import logo from "@/shared/assets/logo.webp";
import { utilities } from "@/shared/styles";
import { FaUser } from "react-icons/fa";
import styles from "./header.module.scss";

const navItems = [
    { label: "Начальная страница", to: "/" },
    { label: "Случайный контент", to: "/discover" },
    { label: "Основная страница", to: "/Save" },
];

export const Header = () => {
    return (
        <header className={styles.header}>
            <div>
                <img alt="Company Logo" src={logo} />
            </div>
            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <NavButton key={item.to} label={item.label} move={item.to} />
                ))}
            </nav>
            <div className={utilities.glowText}>
                <FaUser style={{ fontSize: "48px" }} />
            </div>
        </header>
    );
};
