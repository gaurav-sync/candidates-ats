'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/reduxStore';
import { useEffect } from 'react';
import { setCredentials } from '@/store/reduxStore';
import { useRouter, usePathname } from 'next/navigation';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
}

function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      store.dispatch(setCredentials({ token, user: JSON.parse(user) }));
    } else {
      const publicPaths = ['/login', '/register', '/verify-otp'];
      if (!publicPaths.includes(pathname)) {
        router.push('/login');
      }
    }
  }, [pathname, router]);

  return children;
}
