import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage on init
    const customColors = localStorage.getItem('customThemeColors');
    return {
      theme: localStorage.getItem('theme') || 'light',
      itemsPerPage: parseInt(localStorage.getItem('itemsPerPage')) || 10,
      customTheme: customColors ? JSON.parse(customColors) : {
        bg: '#ffffff',
        text: '#030712',
        cardBg: '#ffffff',
        surface: '#f9fafb',
        textSecondary: '#374151',
        textMuted: '#4b5563',
        border: '#e5e7eb',
        borderStrong: '#d1d5db',
        hover: '#f3f4f6',
        hoverLight: '#f9fafb',
        primary: '#f6c401',
        primaryDark: '#c39b00',
        primaryDarker: '#b69000',
      },
      notifications: {
        email: localStorage.getItem('notifications_email') === 'true',
        push: localStorage.getItem('notifications_push') === 'true',
        updates: localStorage.getItem('notifications_updates') === 'true',
      },
      autoSave: localStorage.getItem('autoSave') === 'true',
      compactMode: localStorage.getItem('compactMode') === 'true',
    };
  });

  // Apply theme on mount and when it changes
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove all theme classes first
    root.classList.remove('dark', 'custom-theme');
    body.classList.remove('dark', 'custom-theme');
    
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else if (settings.theme === 'custom') {
      root.classList.add('custom-theme');
      body.classList.add('custom-theme');
      root.style.colorScheme = 'light';
      
      // Apply custom CSS variables
      if (settings.customTheme) {
        root.style.setProperty('--custom-bg', settings.customTheme.bg);
        root.style.setProperty('--custom-text', settings.customTheme.text);
        root.style.setProperty('--custom-card-bg', settings.customTheme.cardBg);
        root.style.setProperty('--custom-surface', settings.customTheme.surface);
        root.style.setProperty('--custom-text-secondary', settings.customTheme.textSecondary);
        root.style.setProperty('--custom-text-muted', settings.customTheme.textMuted);
        root.style.setProperty('--custom-border', settings.customTheme.border);
        root.style.setProperty('--custom-border-strong', settings.customTheme.borderStrong);
        root.style.setProperty('--custom-hover', settings.customTheme.hover);
        root.style.setProperty('--custom-hover-light', settings.customTheme.hoverLight);
      }
    } else {
      root.style.colorScheme = 'light';
      // Clear custom CSS variables
      root.style.removeProperty('--custom-bg');
      root.style.removeProperty('--custom-text');
      root.style.removeProperty('--custom-card-bg');
      root.style.removeProperty('--custom-surface');
      root.style.removeProperty('--custom-text-secondary');
      root.style.removeProperty('--custom-text-muted');
      root.style.removeProperty('--custom-border');
      root.style.removeProperty('--custom-border-strong');
      root.style.removeProperty('--custom-hover');
      root.style.removeProperty('--custom-hover-light');
    }
  }, [settings.theme, settings.customTheme]);

  // Apply compact mode class to body
  useEffect(() => {
    if (settings.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  }, [settings.compactMode]);

  const updateSetting = (key, value, shouldAutoSave = null) => {
    setSettings((prev) => {
      const newSettings = { ...prev };
      
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        newSettings[parent] = { ...newSettings[parent], [child]: value };
      } else {
        newSettings[key] = value;
      }

      return newSettings;
    });
  };

  const updateSettings = (newSettings, autoSave = true) => {
    setSettings(newSettings);
    if (autoSave && settings.autoSave) {
      saveToLocalStorage(newSettings);
    }
  };

  const saveToLocalStorage = (settingsToSave) => {
    try {
      localStorage.setItem('theme', settingsToSave.theme);
      localStorage.setItem('itemsPerPage', settingsToSave.itemsPerPage.toString());
      if (settingsToSave.customTheme) {
        localStorage.setItem('customThemeColors', JSON.stringify(settingsToSave.customTheme));
      }
      localStorage.setItem('notifications_email', settingsToSave.notifications.email.toString());
      localStorage.setItem('notifications_push', settingsToSave.notifications.push.toString());
      localStorage.setItem('notifications_updates', settingsToSave.notifications.updates.toString());
      localStorage.setItem('autoSave', settingsToSave.autoSave.toString());
      localStorage.setItem('compactMode', settingsToSave.compactMode.toString());
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  };

  const saveSettings = () => {
    saveToLocalStorage(settings);
    
    // Ensure all settings are saved
    try {
      localStorage.setItem('theme', settings.theme || 'light');
      localStorage.setItem('itemsPerPage', (settings.itemsPerPage || 10).toString());
      if (settings.customTheme) {
        localStorage.setItem('customThemeColors', JSON.stringify(settings.customTheme));
      }
      localStorage.setItem('notifications_email', (settings.notifications?.email || false).toString());
      localStorage.setItem('notifications_push', (settings.notifications?.push || false).toString());
      localStorage.setItem('notifications_updates', (settings.notifications?.updates || false).toString());
      localStorage.setItem('autoSave', (settings.autoSave || false).toString());
      localStorage.setItem('compactMode', (settings.compactMode || false).toString());
    } catch (error) {
      console.error('Error in saveSettings:', error);
      throw error;
    }
  };

  const resetSettings = () => {
    const defaultSettings = {
      theme: 'light',
      itemsPerPage: 10,
      customTheme: {
        bg: '#ffffff',
        text: '#030712',
        cardBg: '#ffffff',
        surface: '#f9fafb',
        textSecondary: '#374151',
        textMuted: '#4b5563',
        border: '#e5e7eb',
        borderStrong: '#d1d5db',
        hover: '#f3f4f6',
        hoverLight: '#f9fafb',
        primary: '#f6c401',
        primaryDark: '#c39b00',
        primaryDarker: '#b69000',
      },
      notifications: {
        email: true,
        push: true,
        updates: true,
      },
      autoSave: false,
      compactMode: false,
    };
    updateSettings(defaultSettings, false);
    saveToLocalStorage(defaultSettings);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        updateSettings,
        saveSettings,
        resetSettings,
      }}>
      {children}
    </SettingsContext.Provider>
  );
};

