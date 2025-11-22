import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Select, Option, Switch } from '@material-tailwind/react';
import { useSettings } from '../../context/SettingsContext';

export default function Settings() {
  const { settings, updateSetting, updateSettings, saveSettings, resetSettings } = useSettings();
  const [saveStatus, setSaveStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key, value) => {
    updateSetting(key, value);
    
    // If auto-save is enabled, save immediately
    if (settings.autoSave || key === 'autoSave') {
      // Save to localStorage immediately
      const newSettings = { ...settings };
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        newSettings[parent] = { ...newSettings[parent], [child]: value };
      } else {
        newSettings[key] = value;
      }
      
      // Save directly to localStorage
      try {
        localStorage.setItem('theme', newSettings.theme);
        localStorage.setItem('itemsPerPage', newSettings.itemsPerPage.toString());
        if (newSettings.customTheme) {
          localStorage.setItem('customThemeColors', JSON.stringify(newSettings.customTheme));
        }
        localStorage.setItem('notifications_email', newSettings.notifications.email.toString());
        localStorage.setItem('notifications_push', newSettings.notifications.push.toString());
        localStorage.setItem('notifications_updates', newSettings.notifications.updates.toString());
        localStorage.setItem('autoSave', newSettings.autoSave.toString());
        localStorage.setItem('compactMode', newSettings.compactMode.toString());
        
        setSaveStatus('Settings saved automatically');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        console.error('Error auto-saving settings:', error);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Always save to localStorage when Save button is clicked
      saveSettings();
      
      // Double-check: save all current settings
      localStorage.setItem('theme', settings.theme);
      localStorage.setItem('itemsPerPage', settings.itemsPerPage.toString());
      if (settings.customTheme) {
        localStorage.setItem('customThemeColors', JSON.stringify(settings.customTheme));
      }
      localStorage.setItem('notifications_email', settings.notifications.email.toString());
      localStorage.setItem('notifications_push', settings.notifications.push.toString());
      localStorage.setItem('notifications_updates', settings.notifications.updates.toString());
      localStorage.setItem('autoSave', settings.autoSave.toString());
      localStorage.setItem('compactMode', settings.compactMode.toString());
      
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('Failed to save settings. Please try again.');
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetSettings();
    setSaveStatus('Settings reset to defaults');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${settings.compactMode ? 'compact-mode' : ''}`}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-950 mb-2">
            Settings
          </h1>
          <p className="text-sm text-gray-600">
            Manage your interface preferences and application settings
          </p>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              saveStatus.includes('success')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
            <div className="flex items-center gap-2">
              {saveStatus.includes('success') ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              <span className="text-sm font-medium">{saveStatus}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* General Settings */}
          <Card className="shadow-sm">
            <CardBody className="p-6">
              <Typography variant="h5" color="blue-gray" className="mb-6">
                General Settings
              </Typography>

              <div className="space-y-6">
                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <Select
                    value={settings.theme}
                    onChange={(value) => handleSettingChange('theme', value)}
                    className="!border-gray-300">
                    <Option value="light">Light</Option>
                    <Option value="dark">Dark</Option>
                    <Option value="custom">Custom</Option>
                  </Select>
                  <p className="mt-1 text-xs text-gray-500">
                    Choose between light, dark, or custom theme
                  </p>
                </div>

                {/* Custom Theme Colors - Show only when custom theme is selected */}
                {settings.theme === 'custom' && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <Typography variant="h6" color="blue-gray" className="mb-4">
                      Custom Theme Colors
                    </Typography>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Background
                        </label>
                        <input
                          type="color"
                          value={settings.customTheme?.bg || '#ffffff'}
                          onChange={(e) => {
                            const newCustomTheme = {
                              ...settings.customTheme,
                              bg: e.target.value,
                            };
                            handleSettingChange('customTheme', newCustomTheme);
                          }}
                          className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Text
                        </label>
                        <input
                          type="color"
                          value={settings.customTheme?.text || '#030712'}
                          onChange={(e) => {
                            const newCustomTheme = {
                              ...settings.customTheme,
                              text: e.target.value,
                            };
                            handleSettingChange('customTheme', newCustomTheme);
                          }}
                          className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Card Background
                        </label>
                        <input
                          type="color"
                          value={settings.customTheme?.cardBg || '#ffffff'}
                          onChange={(e) => {
                            const newCustomTheme = {
                              ...settings.customTheme,
                              cardBg: e.target.value,
                            };
                            handleSettingChange('customTheme', newCustomTheme);
                          }}
                          className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Surface
                        </label>
                        <input
                          type="color"
                          value={settings.customTheme?.surface || '#f9fafb'}
                          onChange={(e) => {
                            const newCustomTheme = {
                              ...settings.customTheme,
                              surface: e.target.value,
                            };
                            handleSettingChange('customTheme', newCustomTheme);
                          }}
                          className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Border
                        </label>
                        <input
                          type="color"
                          value={settings.customTheme?.border || '#e5e7eb'}
                          onChange={(e) => {
                            const newCustomTheme = {
                              ...settings.customTheme,
                              border: e.target.value,
                            };
                            handleSettingChange('customTheme', newCustomTheme);
                          }}
                          className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Hover
                        </label>
                        <input
                          type="color"
                          value={settings.customTheme?.hover || '#f3f4f6'}
                          onChange={(e) => {
                            const newCustomTheme = {
                              ...settings.customTheme,
                              hover: e.target.value,
                            };
                            handleSettingChange('customTheme', newCustomTheme);
                          }}
                          className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Items Per Page */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Items Per Page
                  </label>
                  <Select
                    value={settings.itemsPerPage.toString()}
                    onChange={(value) =>
                      handleSettingChange('itemsPerPage', parseInt(value))
                    }
                    className="!border-gray-300">
                    <Option value="5">5</Option>
                    <Option value="10">10</Option>
                    <Option value="20">20</Option>
                    <Option value="50">50</Option>
                    <Option value="100">100</Option>
                  </Select>
                  <p className="mt-1 text-xs text-gray-500">
                    Number of items to display per page in tables and lists
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Display Settings */}
          <Card className="shadow-sm">
            <CardBody className="p-6">
              <Typography variant="h5" color="blue-gray" className="mb-6">
                Display Settings
              </Typography>

              <div className="space-y-6">
                {/* Compact Mode */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Compact Mode
                    </label>
                    <p className="text-xs text-gray-500">
                      Reduce spacing and padding for a more compact view
                    </p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onChange={(e) =>
                      handleSettingChange('compactMode', e.target.checked)
                    }
                    color="blue"
                  />
                </div>

                {/* Auto Save */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Auto Save
                    </label>
                    <p className="text-xs text-gray-500">
                      Automatically save changes without clicking save button
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onChange={(e) =>
                      handleSettingChange('autoSave', e.target.checked)
                    }
                    color="blue"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Notification Settings */}
          <Card className="shadow-sm">
            <CardBody className="p-6">
              <Typography variant="h5" color="blue-gray" className="mb-6">
                Notification Settings
              </Typography>

              <div className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Notifications
                    </label>
                    <p className="text-xs text-gray-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onChange={(e) =>
                      handleSettingChange('notifications.email', e.target.checked)
                    }
                    color="blue"
                  />
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Push Notifications
                    </label>
                    <p className="text-xs text-gray-500">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onChange={(e) =>
                      handleSettingChange('notifications.push', e.target.checked)
                    }
                    color="blue"
                  />
                </div>

                {/* Updates Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      System Updates
                    </label>
                    <p className="text-xs text-gray-500">
                      Get notified about system updates and changes
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.updates}
                    onChange={(e) =>
                      handleSettingChange('notifications.updates', e.target.checked)
                    }
                    color="blue"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <Button
              variant="outlined"
              color="red"
              onClick={handleReset}
              disabled={isSaving}>
              Reset to Defaults
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outlined"
                color="blue-gray"
                onClick={() => window.location.reload()}
                disabled={isSaving}>
                Cancel
              </Button>
              <Button
                color="blue"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2">
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

