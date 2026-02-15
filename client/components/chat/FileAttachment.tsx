'use client'

import React from "react"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface FileAttachmentProps {
  onFileSelect: (file: { name: string; size: number; type: string; url: string }) => void
}

export default function FileAttachment({ onFileSelect }: FileAttachmentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        alert(`File too large! Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        e.target.value = ''; // Reset input
        return;
      }

      setFileName(file.name)
      // Create a data URL for the file
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        onFileSelect({
          name: file.name,
          size: file.size,
          type: file.type,
          url: dataUrl,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="*/*"
      />
      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="bg-slate-100 text-slate-700 hover:bg-slate-200 p-2 rounded-full h-auto"
        title="Attach file"
      >
        📎
      </Button>
    </div>
  )
}
