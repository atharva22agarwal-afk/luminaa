import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Edit3, Save, BookOpen, Calendar, Trash2, Bell, X,
  ChevronLeft, ChevronRight, Heart, Sun, Moon, Cloud, Star
} from 'lucide-react';
import { LuminaButton } from './LuminaButton';

// Mood options with emojis
const MOODS = [
  { emoji: '😔', label: 'Low', value: 'low' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' },
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😊', label: 'Great', value: 'great' },
  { emoji: '✨', label: 'Thriving', value: 'thriving' },
];

// Get today's date formatted
const getTodayFormatted = () => {
  const today = new Date();
  return {
    date: today.toISOString().split('T')[0],
    dayOfWeek: today.toLocaleDateString('en-US', { weekday: 'long' }),
    displayDate: today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
};

// Format date for display
const formatDisplayDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

// Get calendar data for a month
const getCalendarData = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
};

/* -------------------------------------------------------------------------- */
/*                          MEMOIZED EDITOR COMPONENT                         */
/* -------------------------------------------------------------------------- */
// This component isolates the text state to prevent global re-renders on every keystroke.
const ChronicleEditor = React.memo(({ initialText, initialMood, onSave, onDelete, onNew, displayDate, isExisting }) => {
  const [text, setText] = useState(initialText);
  const [selectedMood, setSelectedMood] = useState(MOODS.find(m => m.emoji === initialMood) || null);

  // Sync state when initial props change (e.g., loading a different entry)
  useEffect(() => {
    setText(initialText);
    setSelectedMood(MOODS.find(m => m.emoji === initialMood) || null);
  }, [initialText, initialMood]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <h2 className="ritual-text">{displayDate}</h2>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        {MOODS.map(m => (
          <button 
            key={m.value} 
            onClick={() => setSelectedMood(m)} 
            className={`mood-selector-btn ${selectedMood?.value === m.value ? 'active-mood' : ''}`}
            style={{ 
              fontSize: '1.5rem', 
              background: selectedMood?.value === m.value ? 'rgba(255,255,255,0.15)' : 'transparent', 
              border: selectedMood?.value === m.value ? '1px solid var(--sage-green)' : 'none',
              boxShadow: selectedMood?.value === m.value ? '0 0 15px var(--sage-green)' : 'none',
              cursor: 'pointer', 
              padding: '10px', 
              borderRadius: '50%',
              transition: 'all 0.3s ease'
            }}
          >
            {m.emoji}
          </button>
        ))}
      </div>

      <textarea 
        className="chronicle-textarea"
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="Chronicle your thoughts..." 
        style={{ 
          flex: 1, 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--text-main)', 
          fontSize: '1.25rem', 
          outline: 'none', 
          resize: 'none',
          fontFamily: "'Playfair Display', serif",
          lineHeight: '1.6',
          caretColor: 'var(--spectral-glow)'
        }} 
      />

      <div style={{ display: 'flex', gap: '12px', paddingBottom: '20px' }}>
        <LuminaButton 
          onClick={() => onSave(text, selectedMood)} 
          variant="primary"
        >
          Save Entry
        </LuminaButton>
        
        {isExisting && (
          <LuminaButton 
            onClick={onDelete} 
            variant="action"
            style={{ color: 'red', border: '1px solid rgba(255,0,0,0.2)' }}
          >
            <Trash2 size={18} />
          </LuminaButton>
        )}

        <LuminaButton 
          onClick={onNew} 
          variant="secondary"
        >
          New Entry
        </LuminaButton>
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*                         MAIN SACRED RECORDS COMPONENT                      */
/* -------------------------------------------------------------------------- */
export default function SacredRecords() {
  const todayInfo = useMemo(() => getTodayFormatted(), []);
  const [entries, setEntries] = useState([]);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMoodFilter, setActiveMoodFilter] = useState('all');

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  // Deletion state
  const [entryToDelete, setEntryToDelete] = useState(null);

  // View mode: 'write', 'calendar', 'announcements'
  const [viewMode, setViewMode] = useState('write');

  // Load entries on mount
  useEffect(() => {
    try {
      const savedEntries = JSON.parse(localStorage.getItem('lumina_journal_entries')) || [];
      setEntries(savedEntries);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, []);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    let filtered = [...entries];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.text.toLowerCase().includes(query) ||
        entry.date.toLowerCase().includes(query)
      );
    }
    if (activeMoodFilter !== 'all') {
      filtered = filtered.filter(entry => entry.mood === activeMoodFilter);
    }
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [entries, searchQuery, activeMoodFilter]);

  // Get entry for selected calendar date
  const selectedDateEntry = useMemo(() => {
    if (!selectedCalendarDate) return null;
    const dateStr = selectedCalendarDate.toISOString().split('T')[0];
    return entries.find(entry => entry.date === dateStr);
  }, [entries, selectedCalendarDate]);

  // Calendar navigation
  const calendarData = useMemo(() => {
    return getCalendarData(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedCalendarDate(today);
  };

  /* ------------------------------ EVENT HANDLERS ---------------------------- */

  const handleSaveEntry = useCallback((text, mood) => {
    if (!text.trim()) return;

    try {
      let entryData;
      if (viewingEntry) {
        // Update existing entry (whether it's today's or historical)
        entryData = {
          ...viewingEntry,
          mood: mood?.emoji || viewingEntry.mood,
          text: text.trim(),
        };
        const updatedEntries = entries.map(e => e.id === viewingEntry.id ? entryData : e);
        localStorage.setItem('lumina_journal_entries', JSON.stringify(updatedEntries));
        setEntries(updatedEntries);
        setViewingEntry(entryData);
      } else {
        // Create new entry
        entryData = {
          id: Date.now(),
          date: todayInfo.date,
          dayOfWeek: todayInfo.dayOfWeek,
          mood: mood?.emoji || '😐',
          text: text.trim(),
          timestamp: Date.now()
        };
        const updatedEntries = [entryData, ...entries];
        localStorage.setItem('lumina_journal_entries', JSON.stringify(updatedEntries));
        setEntries(updatedEntries);
        // After creating, set it as viewingEntry so users can edit it or immediately delete it
        setViewingEntry(entryData);
      }
    } catch (err) {
      console.error('Error saving entry:', err);
    }
  }, [entries, viewingEntry, todayInfo]);

  const handleDeleteEntry = useCallback((entryId) => {
    const idToDelete = entryId || viewingEntry?.id;
    if (!idToDelete) return;

    // Show custom confirmation modal instead of window.confirm
    setEntryToDelete(idToDelete);
  }, [viewingEntry]);

  const executeDelete = useCallback(() => {
    if (!entryToDelete) return;
    
    try {
      const updatedEntries = entries.filter(e => e.id !== entryToDelete);
      localStorage.setItem('lumina_journal_entries', JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
      
      if (viewingEntry?.id === entryToDelete) {
        setViewingEntry(null);
      }
      
      if (selectedCalendarDate) {
        const dateStr = selectedCalendarDate.toISOString().split('T')[0];
        const deletedEntry = entries.find(e => e.id === entryToDelete);
        if (deletedEntry && deletedEntry.date === dateStr) {
          setSelectedCalendarDate(null);
        }
      }
      
      setEntryToDelete(null);
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  }, [entries, entryToDelete, viewingEntry, selectedCalendarDate]);

  const startNewEntry = useCallback(() => {
    setViewingEntry(null);
    setSelectedCalendarDate(null);
    // ChronicleEditor will automatically clear its text because it's sync'd to viewingEntry initial props
  }, []);

  const loadEntry = useCallback((entry) => {
    setViewingEntry(entry);
    setViewMode('write');
  }, []);

  const getMoodForDate = (date) => {
    if (!date) return null;
    const dateStr = date.toISOString().split('T')[0];
    const entry = entries.find(e => e.date === dateStr);
    return entry ? entry.mood : null;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    if (!date || !selectedCalendarDate) return false;
    return date.getDate() === selectedCalendarDate.getDate() &&
      date.getMonth() === selectedCalendarDate.getMonth() &&
      date.getFullYear() === selectedCalendarDate.getFullYear();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        gap: '24px',
        width: '100%',
        height: 'calc(100vh - 200px)',
        minHeight: '600px'
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: '260px',
          background: 'var(--bg-sidebar)',
          border: '1px solid var(--glass-border)',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <LuminaButton variant={viewMode === 'write' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewMode('write')} style={{ flex: 1 }}>Write</LuminaButton>
          <LuminaButton variant={viewMode === 'calendar' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewMode('calendar')} style={{ flex: 1 }}>Entries</LuminaButton>
          <LuminaButton variant={viewMode === 'announcements' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewMode('announcements')} style={{ flex: 1 }}>Notes</LuminaButton>
        </div>

        {viewMode === 'write' && (
          <>
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search chronicles..." 
              style={{ 
                width: '100%', 
                padding: '12px 15px', 
                borderRadius: '12px', 
                background: 'var(--glass-mystic)', 
                border: '1px solid var(--glass-border-mystic)', 
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.9rem'
              }} 
            />
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
              {filteredEntries.map(e => (
                <div 
                  key={e.id} 
                  onClick={() => loadEntry(e)} 
                  style={{ 
                    padding: '12px', 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    marginBottom: '8px', 
                    background: viewingEntry?.id === e.id ? 'rgba(127, 149, 137, 0.2)' : 'transparent',
                    border: viewingEntry?.id === e.id ? '1px solid var(--sage-green)' : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{e.date} {e.mood}</div>
                  <div style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.text}</div>
                </div>
              ))}
              {filteredEntries.length === 0 && (
                <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '20px', fontSize: '0.8rem' }}>No records found</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, background: 'var(--bg-card)', borderRadius: '24px', padding: '40px', border: '1px solid var(--glass-border)', overflowY: 'auto' }}>
        {viewMode === 'write' ? (
          <ChronicleEditor 
            key={viewingEntry?.id || 'new'} // Force re-render of local state when entry changes
            initialText={viewingEntry?.text || ''}
            initialMood={viewingEntry?.mood || null}
            displayDate={viewingEntry ? viewingEntry.date : todayInfo.displayDate}
            onSave={handleSaveEntry}
            onDelete={() => handleDeleteEntry(viewingEntry?.id)}
            onNew={startNewEntry}
            isExisting={!!viewingEntry}
          />
        ) : viewMode === 'calendar' ? (
          <div className="calendar-container">
            <div className="calendar-header">
              <h2 className="calendar-month-year">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="calendar-nav-btns" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <LuminaButton variant="icon" onClick={prevMonth} icon={ChevronLeft} />
                <LuminaButton 
                  variant="primary" 
                  size="sm"
                  onClick={goToToday}
                >
                  Today
                </LuminaButton>
                <LuminaButton variant="icon" onClick={nextMonth} icon={ChevronRight} />
              </div>
            </div>

            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-weekday">{day}</div>
              ))}
              {calendarData.map((date, index) => {
                if (!date) return <div key={`empty-${index}`} className="calendar-day-cell empty" />;
                
                const dateStr = date.toISOString().split('T')[0];
                const hasEntry = entries.some(e => e.date === dateStr);
                const mood = getMoodForDate(date);
                const selected = isSelected(date);
                
                return (
                  <motion.div
                    key={dateStr}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`calendar-day-cell ${isToday(date) ? 'today' : ''} ${selected ? 'selected' : ''}`}
                    onClick={() => setSelectedCalendarDate(date)}
                  >
                    <span className="calendar-day-num">{date.getDate()}</span>
                    {mood && <span className="calendar-day-mood">{mood}</span>}
                    {hasEntry && !mood && <div className="calendar-indicator" />}
                  </motion.div>
                );
              })}
            </div>

            {selectedDateEntry ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="selected-entry-preview"
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                <div onClick={() => loadEntry(selectedDateEntry)}>
                  <div className="preview-date">
                    {formatDisplayDate(selectedDateEntry.date)} • {selectedDateEntry.mood}
                  </div>
                  <div className="preview-text">
                    "{selectedDateEntry.text.length > 150 
                      ? selectedDateEntry.text.substring(0, 150) + '...' 
                      : selectedDateEntry.text}"
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--sage-green)', fontWeight: 700 }}>
                    Click to open full chronicle
                  </div>
                </div>
                
                {/* IN-CALENDAR DELETE BUTTON */}
                <LuminaButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEntry(selectedDateEntry.id);
                  }}
                  variant="action"
                  style={{ 
                    position: 'absolute', 
                    top: '20px', 
                    right: '24px', 
                    color: 'red', 
                    border: '1px solid rgba(255,0,0,0.2)', 
                    padding: '8px', 
                  }}
                >
                  <Trash2 size={16} />
                </LuminaButton>
              </motion.div>
            ) : selectedCalendarDate && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="selected-entry-preview" 
                style={{ opacity: 0.7, borderLeft: '1px solid var(--glass-border)' }}
              >
                <div className="preview-date">{formatDisplayDate(selectedCalendarDate.toISOString())}</div>
                <div className="preview-text">No chronicles recorded for this day.</div>
                <LuminaButton 
                  variant="primary"
                  onClick={() => {
                    setViewMode('write');
                    setViewingEntry(null);
                  }}
                  style={{ marginTop: '15px' }}
                >
                  Write Entry
                </LuminaButton>
              </motion.div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '100px' }}>
            <h2>Notes View</h2>
            <p>Implement premium announcements system here.</p>
          </div>
        )}
      </div>

      {/* CUSTOM CONFIRMATION MODAL */}
      <AnimatePresence>
        {entryToDelete && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', 
              top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.6)', 
              backdropFilter: 'blur(10px)', 
              zIndex: 1000, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ 
                background: 'var(--bg-card)', 
                backdropFilter: 'blur(20px)',
                padding: '45px 40px', 
                borderRadius: '32px', 
                border: '1px solid var(--glass-border)', 
                textAlign: 'center', 
                maxWidth: '440px',
                boxShadow: 'var(--card-shadow)'
              }}
            >
              <div style={{ filter: 'drop-shadow(0 0 15px rgba(255, 107, 107, 0.2))' }}>
                <Trash2 size={54} color="#FF6B6B" strokeWidth={1} style={{ marginBottom: '24px' }} />
              </div>
              <h3 style={{ marginBottom: '15px', fontSize: '1.75rem', fontFamily: "'Playfair Display', serif", color: 'var(--text-main)', letterSpacing: '0.5px' }}>
                Sever This Chronicle?
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '35px', lineHeight: '1.6', fontSize: '1.05rem', fontWeight: 300 }}>
                This action cannot be undone. The memories recorded here will be permanently lost.
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <LuminaButton 
                  onClick={() => setEntryToDelete(null)} 
                  variant="secondary"
                >
                  Return
                </LuminaButton>
                <LuminaButton 
                  onClick={executeDelete} 
                  variant="action"
                  style={{ color: '#FF6B6B', borderColor: 'rgba(255, 107, 107, 0.3)' }}
                >
                  Sever Memory
                </LuminaButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
