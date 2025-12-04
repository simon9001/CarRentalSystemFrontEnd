// components/settings/SaveButton.tsx
import React from 'react'
import { Save } from 'lucide-react'

interface SaveButtonProps {
  isLoading?: boolean
  disabled?: boolean
  onClick?: () => void
  label?: string
}

const SaveButton: React.FC<SaveButtonProps> = ({
  isLoading = false,
  disabled = false,
  onClick,
  label = "Save Changes"
}) => {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="btn btn-primary"
    >
      {isLoading ? (
        <>
          <span className="loading loading-spinner loading-sm"></span>
          Saving...
        </>
      ) : (
        <>
          <Save size={16} />
          {label}
        </>
      )}
    </button>
  )
}

export default SaveButton