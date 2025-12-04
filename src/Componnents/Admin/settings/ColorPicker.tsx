// components/settings/ColorPicker.tsx
import React from 'react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label }) => {
  const presetColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ]

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="flex items-center gap-3">
        {/* Color Input */}
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 cursor-pointer rounded border border-gray-300"
          />
        </div>

        {/* Preset Colors */}
        <div className="flex gap-2">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={`w-8 h-8 rounded border-2 ${
                value === color ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Current Color Display */}
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm font-mono text-gray-600">{value}</span>
        </div>
      </div>
    </div>
  )
}

export default ColorPicker