/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import { useState } from 'react';

import Router from 'src/routes/sections';
import ThemeProvider from 'src/theme';

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <ThemeProvider>
      <Router 
        isAuthenticated={isAuthenticated} 
        setIsAuthenticated={setIsAuthenticated} 
        isStaff={isStaff} 
        setIsStaff={setIsStaff} 
        isAdmin={isAdmin} 
        setIsAdmin={setIsAdmin} 
      />
    </ThemeProvider>
  );
}
