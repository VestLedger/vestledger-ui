'use client';

import { useState, lazy, Suspense } from 'react';
import { StaticButton } from '@/ui/static';

const LoginModal = lazy(() => import('./login-modal').then(mod => ({ default: mod.LoginModal })));

export function LoginButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <StaticButton variant="light" onClick={() => setShowModal(true)}>
        Login
      </StaticButton>
      {showModal && (
        <Suspense fallback={null}>
          <LoginModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </Suspense>
      )}
    </>
  );
}
