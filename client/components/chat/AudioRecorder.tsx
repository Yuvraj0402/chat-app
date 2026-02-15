'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface AudioRecorderProps {
  onAudioRecorded: (audioData: { name: string; size: number; type: string; url: string }) => void
}

export default function AudioRecorder({ onAudioRecorded }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string
          onAudioRecorded({
            name: `audio-${Date.now()}.webm`,
            size: audioBlob.size,
            type: 'audio/webm',
            url: dataUrl,
          })
        }
        reader.readAsDataURL(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1)
      }, 1000)
    } catch (error) {
      console.log('[v0] Microphone access denied or not available')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-red-50 rounded-full px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-red-600">{formatTime(recordingTime)}</span>
        </div>
        <Button
          type="button"
          onClick={stopRecording}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 h-auto"
          title="Stop recording"
        >
          ⏹️
        </Button>
      </div>
    )
  }

  return (
    <Button
      type="button"
      onClick={startRecording}
      className="bg-slate-100 text-slate-700 hover:bg-slate-200 p-2 rounded-full h-auto"
      title="Record audio"
    >
      🎤
    </Button>
  )
}
