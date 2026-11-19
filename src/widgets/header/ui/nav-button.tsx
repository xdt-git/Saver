import { NavLink } from "react-router-dom";
import { utilities } from "@/shared/styles";
import styles from "./nav-button.module.scss";

interface NavButtonProps {
    label: string;
    move: string;
}

export const NavButton = ({ label, move }: NavButtonProps) => {
    return (
        <NavLink to={move}>
            <button className={`${styles.navButton} ${utilities.glowText}`}>{label}</button>
        </NavLink>
    );
};
