import "../../global/css/button.scss";
import "../../global/global.scss";
import PropTypes from "prop-types";

const Card = ({ description, altBlue, imgBlue }) => {
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

Card.propTypes = {
    imgBlue: PropTypes.string.isRequired,
    altBlue: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
};

export default Card;
