import React, { useEffect, useRef } from 'react';

export default function CelestialCanvas({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Only run the starfield in dark mode to fit the Midnight Oasis aesthetic
    if (theme !== 'dark') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      opacity: Math.random(),
      fadeSpeed: Math.random() * 0.02 + 0.005,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = theme === 'dark' ? '#7E77DD' : '#A8C3B0'; // Stars match Spectral Glow in dark, Sage in light

      stars.forEach((star) => {
        ctx.globalAlpha = star.opacity * (theme === 'dark' ? 0.6 : 0.3);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        star.opacity += star.fadeSpeed;
        if (star.opacity > 0.8 || star.opacity < 0.1) {
          star.fadeSpeed = -star.fadeSpeed;
        }
      });

      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'absolute',
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 0, 
        opacity: 0.6, 
        pointerEvents: 'none'
      }} 
    />
  );
}
