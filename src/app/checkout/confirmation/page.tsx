import { Suspense } from 'react';
import ConfirmationClientPage from './ConfirmationClientPage';
import { Skeleton } from '@/components/ui/skeleton';

// This is a new Server Component that wraps the existing page (which will be a Client Component).
// The Suspense boundary is added here.
export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="h-full w-full "><Skeleton className='h-full w-full '/></div>}>
      <ConfirmationClientPage />
    </Suspense>
  );
}
