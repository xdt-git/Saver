import "@/shared/ui/button/button.scss";
import "@/shared/styles/global.scss";
import PropTypes from "prop-types";

export const CategoryCard = ({ description, altBlue, imgBlue }) => {
    return (
        <div className="flex">
            <img alt={altBlue} src={imgBlue} />
            <div className="column">
                <span className="glow-text">{description}</span>
                <button className="gradient-button">Сохранить</button>
            </div>
        </div>
    );
};

CategoryCard.propTypes = {
    imgBlue: PropTypes.string.isRequired,
    altBlue: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
};
