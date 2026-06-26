import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  path: '/',
  navigate: () => {},
});

function getPath() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  return hash.split('?')[0] || '/';
}

export function Router({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    // Handle initial load with no hash
    if (!window.location.hash) {
      window.location.hash = '/';
    }
    function onHashChange() {
      setPath(getPath());
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
    // setPath is driven by the hashchange event above, but also set immediately
    setPath(to);
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

export function useNavigate() {
  return useContext(RouterContext).navigate;
}

export function useLocation() {
  const { path } = useContext(RouterContext);
  return { pathname: path };
}

export function Link({
  to,
  children,
  className,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const { navigate } = useRouter();
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={e => {
        e.preventDefault();
        navigate(to);
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}

// --------------- Route / Routes ---------------

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
}

function matchRoute(routePath: string, currentPath: string): boolean {
  if (routePath === '*') return true;
  if (routePath === currentPath) return true;
  const rParts = routePath.split('/');
  const cParts = currentPath.split('/');
  if (rParts.length !== cParts.length) return false;
  return rParts.every((part, i) => part.startsWith(':') || part === cParts[i]);
}

export function Routes({ children }: { children: React.ReactNode }) {
  const { path } = useRouter();

  let matched: React.ReactNode = null;
  React.Children.forEach(children, child => {
    if (matched) return;
    if (!React.isValidElement(child)) return;
    const props = child.props as RouteConfig;
    if (matchRoute(props.path, path)) {
      matched = props.element;
    }
  });
  return <>{matched}</>;
}

export function Route(_props: RouteConfig & { replace?: boolean }) {
  // Never rendered directly — Routes reads props from it
  return null;
}

export function Navigate({ to }: { to: string; replace?: boolean }) {
  const { navigate } = useRouter();
  useEffect(() => {
    navigate(to);
  }, []);
  return null;
}
