import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Download, Zap, Upload, X } from 'lucide-react';
import { LuminaButton } from './LuminaButton';

export default function VisionPortal() {
  const [intention, setIntention] = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [visionBoard, setVisionBoard] = useState(() => {
    return JSON.parse(localStorage.getItem('lumina_vision_board')) || [];
  });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImage(reader.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading image:", error);
      alert("Failed to load image. Please try another file.");
    }
  };

  const saveToBoard = (e) => {
    if (e) e.preventDefault();
    if (!currentImage) return;

    const newItem = {
      id: Date.now(),
      url: currentImage,
      intention: intention.trim() || 'Anchored Vision'
    };
    const newBoard = [newItem, ...visionBoard].slice(0, 10); // Keep last 10
    setVisionBoard(newBoard);
    
    try {
        localStorage.setItem('lumina_vision_board', JSON.stringify(newBoard));
    } catch (err) {
        console.error("Failed to save to localStorage. Image might be too large.", err);
        setSaveError("Board is full or image is too large. Cannot save more items.");
        setVisionBoard(visionBoard); // Revert
        return;
    }
    
    // Reset state for next creation
    setIntention('');
    setCurrentImage(null);
  };

  const removeImage = (id) => {
    const newBoard = visionBoard.filter(item => item.id !== id);
    setVisionBoard(newBoard);
    localStorage.setItem('lumina_vision_board', JSON.stringify(newBoard));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100%',
        paddingBottom: '120px'
      }}
    >
      <div className="divine-header">
        <h1>Vision Portal</h1>
        <p>Materialize your intentions into imagery. Upload and anchor your reality.</p>
        {saveError && (
          <p style={{ color: '#ff6b6b', marginTop: '10px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            {saveError}
            <LuminaButton variant="icon" size="sm" onClick={() => setSaveError(null)} icon={X} style={{ marginLeft: '10px' }} />
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '40px' }}>
        {/* LEFT: GENERATION CONSOLE */}
        <div style={{ 
          background: 'var(--bg-card)', 
          padding: '40px', 
          borderRadius: '30px', 
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--card-shadow)',
          alignSelf: 'start'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--sage-muted)', color: 'var(--sage-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Anchor Reality</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload an image that aligns with your goal</div>
            </div>
          </div>

          <form onSubmit={saveToBoard} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Image Upload Area */}
            {!currentImage ? (
                <label style={{
                  width: '100%',
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  borderRadius: '20px',
                  border: '2px dashed var(--glass-border)',
                  background: 'var(--bg-element)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  <ImageIcon size={32} style={{ marginBottom: '10px' }} />
                  <span>Click to select image</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    style={{ display: 'none' }} 
                  />
                </label>
            ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ position: 'relative' }}
                  >
                      <img 
                        src={currentImage} 
                        alt="Preview" 
                        style={{
                          width: '100%',
                          borderRadius: '20px',
                          border: '1px solid var(--sage-green)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}
                      />
                      <LuminaButton
                        type="button"
                        variant="circle"
                        onClick={() => setCurrentImage(null)}
                        icon={X}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          border: 'none'
                        }}
                      />
                  </motion.div>
                </AnimatePresence>
            )}

            <input
              type="text"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="What does this image represent?"
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '16px',
                border: '2px solid var(--glass-border)',
                background: 'var(--bg-element)',
                color: 'var(--text-main)',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: "'Geist', sans-serif"
              }}
            />
            
            <LuminaButton
              type="submit"
              variant="primary"
              disabled={!currentImage}
              icon={Download}
              style={{
                width: '100%',
                padding: '18px',
                fontSize: '1rem',
                opacity: (!currentImage) ? 0.7 : 1,
              }}
            >
              Anchor to Vision Board
            </LuminaButton>
          </form>
        </div>

        {/* RIGHT: VISION BOARD GALLERY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--glass-border)' }}>
            <Zap size={18} color="var(--sage-deep)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Anchored Realities</h3>
          </div>

          {visionBoard.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '20px' }}>
              Your vision board is empty.<br/>Create your first materialization to anchor it here.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <AnimatePresence>
                {visionBoard.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="hover-lift"
                    style={{ position: 'relative', group: 'img-card' }}
                  >
                    <img 
                      src={item.url} 
                      alt={item.intention}
                      style={{ 
                        width: '100%', 
                        aspectRatio: '1', 
                        objectFit: 'cover', 
                        borderRadius: '16px',
                        border: '1px solid var(--glass-border)'
                      }}
                    />
                    <div style={{ 
                      position: 'absolute', 
                      bottom: 0, left: 0, right: 0, 
                      padding: '15px',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      borderRadius: '0 0 16px 16px',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backdropFilter: 'blur(5px)'
                    }}>
                      {item.intention.length > 40 ? item.intention.substring(0, 40) + '...' : item.intention}
                    </div>
                    <LuminaButton 
                      variant="circle"
                      onClick={() => removeImage(item.id)}
                      icon={X}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        border: 'none',
                        backdropFilter: 'blur(5px)'
                      }}
                      title="Release Intention"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
