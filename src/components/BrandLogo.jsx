import React from "react";

const BrandLogo = () => (
    <a
        href="/"
        aria-label="Go to homepage"
        style={{
            textDecoration: "none",
            color: "#fff",
            display: "flex",
            alignItems: "center",
        }}
    >
        <img src="https://imgur.com/Z5hv7K9.png" alt="SignSense logo" />
        <span
            style={{
                color: "#fff",
                fontSize: "24px",
                fontWeight: 400,
                letterSpacing: "0.5px",
                marginLeft: "5px",
            }}
        >
            SignSense
        </span>
    </a>
);

export default BrandLogo;
