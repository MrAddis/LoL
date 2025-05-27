'use client';

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function UpdateButton() {
  const handleClick = () => {
    window.location.reload();
  };

  return (
    <Button
      variant="default"
      size="sm"
      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-auto"
      onClick={handleClick}
    >
      <RefreshCw className="mr-1.5 h-3 w-3" />
      Update
    </Button>
  );
}
