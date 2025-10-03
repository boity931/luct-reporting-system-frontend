import React from 'react';
import '../index.css'; // ✅ use global styles

const Footer = () => {
  return (
    <footer className="app-footer">
      <p>© {new Date().getFullYear()} LUCT Reporting System. All rights reserved.</p>
    </footer>
  );
};

export default Footer;

