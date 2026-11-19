import { NavLink } from "react-router-dom";
import "./nav-button.scss";
import "@/shared/styles/global.scss";

interface NavButtonProps {
    label: string;
    move: string;
}

export const NavButton = ({ label, move }: NavButtonProps) => {
    return (
        <NavLink to={move}>
            <button className="nav-button glow-text">{label}</button>
        </NavLink>
    );
};
