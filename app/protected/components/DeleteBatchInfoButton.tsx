'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface DeleteBatchInfoButtonProps {
  batchId: string;
  deleteBatchInfo: (
    batchId: string
  ) => Promise<{ success: boolean; message: string }>;
}

export default function DeleteBatchInfoButton({
  batchId,
  deleteBatchInfo
}: DeleteBatchInfoButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this batch information?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteBatchInfo(batchId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting batch info:', error);
      toast.error('Failed to delete batch information');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      onClick={handleDelete}
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      disabled={isDeleting}
    >
      <Trash2 size="16" />
    </Button>
  );
}
