import React from "react";

const Button = ({ onClick, children, variant = "primary" }) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        danger: "bg-red-600 text-white hover:bg-red-700",
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]}`}
        >
            {children}
        </button>
    );
};

export default Button;
