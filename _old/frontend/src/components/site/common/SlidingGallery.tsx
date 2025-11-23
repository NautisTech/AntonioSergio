"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

export interface GalleryImage {
    src: string;
    title: string;
    description?: string;
}

interface SlidingGalleryProps {
    images: GalleryImage[];
    autoScrollInterval?: number;
    itemWidth?: number;
    itemHeight?: number;
    showIndicators?: boolean;
    className?: string;
}

const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            staggerChildren: 0.1,
            duration: 0.5
        }
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
        }
    },
    hover: {
        scale: 1.05,
        boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
        transition: {
            duration: 0.3,
        }
    }
};

export function SlidingGallery({
    images,
    autoScrollInterval = 3000,
    itemWidth = 320,
    itemHeight = 320,
    showIndicators = true,
    className = ""
}: SlidingGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [expandedImage, setExpandedImage] = useState<GalleryImage | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const nextIndex = prevIndex + 1;
                return nextIndex >= images.length ? 0 : nextIndex;
            });
        }, autoScrollInterval);

        return () => clearInterval(interval);
    }, [autoScrollInterval, images.length]);

    const expandImage = (img: GalleryImage) => {
        setExpandedImage(img);
    };

    const closeExpandedImage = () => {
        setExpandedImage(null);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    }; if (!images || images.length === 0) {
        return (
            <div className={`gallery-container ${className}`} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: itemHeight,
                background: '#f5f5f5',
                borderRadius: '12px',
                margin: '40px auto',
                color: '#666'
            }}>
                Nenhuma imagem disponível
            </div>
        );
    }

    return (
        <>
            <div className={`gallery-container ${className}`} style={{
                maxWidth: '100%',
                margin: '40px auto',
                padding: '0 20px',
                position: 'relative'
            }}>
                <motion.div
                    ref={containerRef}
                    className="gallery"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        display: "flex",
                        gap: "20px",
                        overflow: "hidden",
                        paddingBottom: "20px"
                    }}
                >
                    <motion.div
                        style={{
                            display: "flex",
                            gap: "20px",
                            transform: `translateX(-${currentIndex * itemWidth}px)`,
                            transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                            willChange: "transform"
                        }}
                    >
                        {[...images, ...images, ...images].map((img, index) => (
                            <motion.div
                                key={`${img.title}-${index}`}
                                className="gallery-item"
                                variants={itemVariants}
                                whileHover="hover"
                                onClick={() => expandImage(img)}
                                style={{
                                    position: "relative",
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    background: "#eee",
                                    minWidth: itemWidth - 20,
                                    height: itemHeight,
                                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                                }}
                            >
                                <img
                                    src={img.src}
                                    alt={img.title}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        display: "block",
                                    }}
                                />
                                {/* Label no canto inferior esquerdo */}
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: "15px",
                                        left: "15px",
                                        right: "15px",
                                        color: "white",
                                        fontWeight: "600",
                                        fontSize: "16px",
                                        textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                                        zIndex: 2
                                    }}
                                >
                                    {img.title}
                                    {img.description && (
                                        <div style={{
                                            fontSize: "12px",
                                            color: "#cccccc",
                                            marginTop: "4px",
                                            textShadow: "0 1px 2px rgba(0,0,0,0.8)"
                                        }}>
                                            {img.description}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {showIndicators && images.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '20px'
                        }}
                    >
                        {images.map((_, index) => (
                            <motion.button
                                key={index}
                                onClick={() => goToSlide(index)}
                                whileHover={{ scale: 1.3 }}
                                whileTap={{ scale: 0.9 }}
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: currentIndex === index ? '#dc143c' : 'rgba(0,0,0,0.3)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    transform: currentIndex === index ? 'scale(1.2)' : 'scale(1)'
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </div>

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
                        background: 'rgba(0, 0, 0, 0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        cursor: 'pointer',
                        backdropFilter: 'blur(10px)',
                        padding: '20px'
                    }}
                >
                    <motion.div
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
                        style={{
                            position: 'relative',
                            maxWidth: '98vw',
                            maxHeight: '98vh',
                            cursor: 'default'
                        }}
                    >
                        <motion.img
                            src={expandedImage.src}
                            alt={expandedImage.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                borderRadius: '16px',
                                boxShadow: '0 60px 180px rgba(0,0,0,0.9), 0 0 0 2px rgba(255,255,255,0.15)',
                                filter: 'brightness(1.05) contrast(1.1)'
                            }}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
                            style={{
                                position: 'absolute',
                                bottom: '25px',
                                left: '25px',
                                right: '25px',
                                color: 'white',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                padding: '20px',
                                borderRadius: '0 0 16px 16px'
                            }}
                        >
                            <h3 style={{
                                margin: 0,
                                fontSize: '32px',
                                fontWeight: '700',
                                textShadow: '0 4px 8px rgba(0,0,0,0.9)',
                                letterSpacing: '-0.5px'
                            }}>
                                {expandedImage.title}
                            </h3>
                            {expandedImage.description && (
                                <p style={{
                                    margin: '10px 0 0 0',
                                    fontSize: '20px',
                                    color: '#e0e0e0',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                                    fontWeight: '400'
                                }}>
                                    {expandedImage.description}
                                </p>
                            )}
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
}
