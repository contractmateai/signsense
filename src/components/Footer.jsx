
import React from 'react';

const Footer = () => (
  <footer className="site-footer">
    <div className="footer-left">
      <a href="https://signsense.io" target="_blank" rel="noopener noreferrer">
        <img className="footer-logo" src="https://imgur.com/BcUqgKZ.png" alt="SignSense logo" />
      </a>
      <div className="footer-left-inner">
        <a href="https://signsense.io" className="footer-brand" target="_blank" rel="noopener noreferrer">
          SignSense
        </a>
        <div className="footer-tagline">
          <div>No confusion, no legal jargon.</div>
          <div>For informational use only. Not legal advice.</div>
        </div>
      </div>
    </div>
    <div className="footer-col">
      <div className="footer-title">Quick Menu</div>
      <nav className="footer-links">
        <a href="https://www.youtube.com/watch?v=jpMGv9ffqts" target="_blank" rel="noopener noreferrer">How it Works</a>
        <a href="https://tally.so/r/3EGJpA" target="_blank" rel="noopener noreferrer">Leave Review</a>
      </nav>
    </div>
    <div className="footer-col">
      <div className="footer-title">Information</div>
      <nav className="footer-links">
        <a href="contact.html">Contact</a>
        <a href="/">Home</a>
      </nav>
    </div>
    <div className="footer-col">
      <div className="footer-title">Socials</div>
      <nav className="footer-links">
        <a href="https://x.com/signsense2026?s=21" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">X</a>
        <a href="https://www.youtube.com/@SignSense2026" target="_blank" rel="noopener noreferrer" aria-label="YouTube">YouTube</a>
        <a href="https://www.instagram.com/signsense.io/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
      </nav>
    </div>
    <div className="footer-bottom">
      <div className="footer-divider"></div>
      <div className="footer-bottom-links">
        <a href="privacy.html">Privacy Policy</a>
        <a href="terms.html">Terms of Service</a>
        <a href="cookies.html">Cookie Policy</a>
        <span className="footer-copy">© 2025 SignSense. All rights reserved.</span>
      </div>
    </div>
  </footer>
);

export default Footer;
