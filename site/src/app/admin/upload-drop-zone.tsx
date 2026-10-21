'use client';
import { useEffect, useRef, useState, type ReactNode, type DragEvent } from 'react';

export function UploadDropZone({ label, className = '', disabled, multiple = false, onFiles, onError, children }: {
  label: string; className?: string; disabled: boolean; multiple?: boolean;
  onFiles: (files: File[]) => void; onError: (message: string) => void; children: ReactNode;
}) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  useEffect(() => { if (disabled) { depth.current = 0; setDragging(false); } }, [disabled]);
  const filesOnly = (event: DragEvent) => Array.from(event.dataTransfer.types).includes('Files');
  return <div role="group" aria-label={label} aria-disabled={disabled}
    className={`studio-dropzone ${className} ${dragging ? 'is-dragging' : ''}`}
    onDragEnter={event => {
      if (!filesOnly(event)) return;
      event.preventDefault();
      if (!disabled) { depth.current++; setDragging(true); }
    }}
    onDragOver={event => {
      if (!filesOnly(event)) return;
      event.preventDefault(); event.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
    }}
    onDragLeave={event => {
      if (!filesOnly(event)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (!depth.current) setDragging(false);
    }}
    onDrop={event => {
      if (!filesOnly(event)) return;
      event.preventDefault(); event.stopPropagation(); depth.current = 0; setDragging(false);
      if (disabled) return;
      const files = Array.from(event.dataTransfer.files);
      if (!multiple && files.length > 1) { onError('项目封面一次只能上传一张图片'); return; }
      if (files.length) onFiles(files);
    }}>
    {children}
  </div>;
}
