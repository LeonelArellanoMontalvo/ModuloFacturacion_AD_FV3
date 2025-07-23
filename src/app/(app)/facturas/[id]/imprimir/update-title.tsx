
"use client";

import { useEffect } from 'react';

interface UpdateTitleProps {
  title: string;
}

export function UpdateTitle({ title }: UpdateTitleProps) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title;
    
    // Revert to the original title when the component unmounts
    return () => {
      document.title = originalTitle;
    };
  }, [title]);

  return null; // This component does not render anything
}
