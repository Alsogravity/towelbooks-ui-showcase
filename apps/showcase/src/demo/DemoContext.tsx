import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { initialLibrary, type LibraryItem, type Reflection } from './data';
import { useI18n } from '../i18n';
function useDemoState() {
  const [library, setLibrary] = useState<LibraryItem[]>(initialLibrary);
  const [memberships, setMemberships] = useState<string[]>(['margens']);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notice, setNotice] = useState('');
  const sequence = useRef(0);
  const { ui } = useI18n();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  function reset() {
    setLibrary(initialLibrary());
    setMemberships(['margens']);
    setReflections([]);
    setNotice(ui('resetDone'));
  }
  function reflect(roomId: string, body: string) {
    const text = body.trim();
    if (!text) return;
    setReflections((items) => [
      ...items,
      { id: ++sequence.current, roomId, body: text },
    ]);
    setNotice(ui('postDone'));
  }
  return {
    library,
    setLibrary,
    memberships,
    setMemberships,
    reflections,
    reflect,
    theme,
    setTheme,
    notice,
    setNotice,
    reset,
  };
}
const DemoContext = createContext<ReturnType<typeof useDemoState> | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const value = useDemoState();
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error('DemoProvider required');
  return value;
}
