"use client";

import React, { useState, useEffect } from "react";
import DesktopNavbar from "./Desktop";
import MobileNavbar from "./Mobile";

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className = "" }) => {
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for mobile navbar header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1200; // xl breakpoint

      // Close mobile sidebar if switching to desktop
      if (!mobile && showMobileSidebar) {
        setShowMobileSidebar(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [showMobileSidebar]);

  const handleMobileToggle = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  const handleMobileClose = () => {
    setShowMobileSidebar(false);
  };

  return (
    <>
      {/* Desktop Navbar - visible on lg screens and up */}
      <div className={`d-none d-xl-block ${className}`}>
        <DesktopNavbar />
      </div>

      {/* Mobile Navbar Header - visible on screens smaller than lg */}
      <div className={`d-block d-xl-none ${className}`}>
        <MobileNavbar onClose={handleMobileClose} />
      </div>
    </>
  );
};

export default Navbar;
