import { FaUser } from "react-icons/fa";
import logo from "@/shared/assets/logo.webp";
import { Button } from "@/shared/ui/button";
import { Text, glowClassName } from "@/shared/ui/text";
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
                    <Button key={item.to} to={item.to} variant="nav" className={glowClassName}>
                        {item.label}
                    </Button>
                ))}
            </nav>
            <Text as="div" glow>
                <FaUser className={styles.profileIcon} />
            </Text>
        </header>
    );
};
