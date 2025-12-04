// components/settings/LogoUploader.tsx
import React, { useState, useRef } from 'react'
import { Upload, X, Image } from 'lucide-react'

interface LogoUploaderProps {
  currentLogo?: string | null
  onLogoChange: (file: File | null) => void
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ currentLogo, onLogoChange }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogo || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        onLogoChange(file)
      }
    }
  }

  const handleRemoveLogo = () => {
    setPreviewUrl(null)
    onLogoChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        {/* Logo Preview */}
        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Company logo"
                className="w-28 h-28 object-contain rounded"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <Image size={32} className="text-gray-400" />
          )}
        </div>

        {/* Upload Controls */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-outline"
          >
            <Upload size={16} />
            Upload Logo
          </button>
          <p className="text-sm text-gray-500">
            Recommended: 256x256px PNG or JPG
          </p>
        </div>
      </div>
    </div>
  )
}

export default LogoUploader