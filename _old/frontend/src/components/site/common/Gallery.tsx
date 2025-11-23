"use client";

import React, { useState } from "react";
import { motion } from "motion/react";

const images = [
    {
        src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80",
        title: "A turquoise colored sea",
        category: "Landscape"
    },
    {
        src: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80",
        title: "Frozen Mount",
        category: "Mountain"
    },
    {
        src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=500&q=80",
        title: "Earthly Clay",
        category: "Nature"
    },
    {
        src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
        title: "Man Captured",
        category: "Portrait"
    },
    {
        src: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80",
        title: "Mountain with pines",
        category: "Forest"
    },
    {
        src: "https://images.unsplash.com/photo-1516466723877-5a7d4c75a23e?auto=format&fit=crop&w=600&q=80",
        title: "Mountains",
        category: "Landscape"
    },
    {
        src: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80",
        title: "Beautiful Sunset",
        category: "Sky"
    },
];

const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            staggerChildren: 0.15,
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1] as const
        }
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.9
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1] as const
        }
    },
    hover: {
        scale: 1.02,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1] as const
        }
    }
};

export function Gallery() {
    const [expandedImage, setExpandedImage] = useState<typeof images[0] | null>(null);

    const expandImage = (img: typeof images[0]) => {
        setExpandedImage(img);
    };

    const closeExpandedImage = () => {
        setExpandedImage(null);
    };

    return (
        <>
            <motion.div
                className="gallery"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gridTemplateRows: "repeat(3, 1fr)",
                    gap: "15px",
                    maxWidth: 1000,
                    height: "600px",
                    margin: "40px auto",
                    padding: "0 20px",
                    perspective: "1000px"
                }}
            >
                {images.map((img, index) => {
                    let gridArea = "";
                    switch (index) {
                        case 0: gridArea = "1 / 1 / 2 / 2"; break;
                        case 1: gridArea = "1 / 2 / 3 / 4"; break;
                        case 2: gridArea = "2 / 1 / 3 / 2"; break;
                        case 3: gridArea = "2 / 4 / 3 / 5"; break;
                        case 4: gridArea = "1 / 4 / 2 / 5"; break;
                        case 5: gridArea = "3 / 1 / 4 / 3"; break;
                        case 6: gridArea = "3 / 3 / 4 / 5"; break;
                        default: gridArea = "auto";
                    }

                    return (
                        <motion.div
                            key={img.title}
                            className="gallery-item"
                            variants={itemVariants}
                            whileHover="hover"
                            onClick={() => expandImage(img)}
                            style={{
                                gridArea,
                                position: "relative",
                                overflow: "hidden",
                                cursor: "pointer",
                                background: "#f0f0f0"
                            }}
                        >
                            <motion.img
                                src={img.src}
                                alt={img.title}
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.6 }}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                }}
                            />

                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "15px",
                                    left: "15px",
                                    right: "15px",
                                    color: "white",
                                    fontWeight: "700",
                                    fontSize: "18px",
                                    textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                                    zIndex: 2
                                }}
                            >
                                {img.title}
                                <div style={{
                                    fontSize: "12px",
                                    color: "#cccccc",
                                    marginTop: "4px",
                                    fontWeight: "400",
                                    textShadow: "0 1px 2px rgba(0,0,0,0.8)"
                                }}>
                                    {img.category}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {expandedImage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onClick={closeExpandedImage}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)'
                    }}
                >
                    <motion.img
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.85, opacity: 0 }}
                        transition={{
                            type: "spring",
                            damping: 12,
                            stiffness: 400,
                            duration: 0.3
                        }}
                        onClick={(e) => e.stopPropagation()}
                        src={expandedImage.src}
                        alt={expandedImage.title}
                        style={{
                            maxWidth: '98vw',
                            maxHeight: '98vh',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            borderRadius: '16px',
                            boxShadow: '0 60px 180px rgba(0,0,0,0.9), 0 0 0 2px rgba(255,255,255,0.15)',
                            cursor: 'default',
                            filter: 'brightness(1.05) contrast(1.1)'
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '20px',
                            right: '20px',
                            color: 'white'
                        }}
                    >
                        <h3 style={{
                            margin: 0,
                            fontSize: '28px',
                            fontWeight: '700',
                            textShadow: '0 3px 6px rgba(0,0,0,0.8)'
                        }}>
                            {expandedImage.title}
                        </h3>
                        <p style={{
                            margin: '8px 0 0 0',
                            fontSize: '18px',
                            color: '#cccccc',
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                        }}>
                            {expandedImage.category}
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
}