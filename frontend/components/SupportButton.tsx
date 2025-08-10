import React, { useState } from 'react';

interface SupportButtonProps {
    content: string;
    url: string;
    color: string;
    hoverColor: string;
    textColor?: string;
}

const SupportButton: React.FC<SupportButtonProps> = ({
    content,
    url,
    color,
    hoverColor,
    textColor = '#FFFFFF'
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleRedirect = () => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const style = {
        backgroundColor: isHovered ? hoverColor : color,
        color: textColor,
    };

    return (
        <button
            onClick={handleRedirect}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={style}
            className=" max-w-sm sm:w-auto font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
            {content}
        </button>
    );
};

export default SupportButton;