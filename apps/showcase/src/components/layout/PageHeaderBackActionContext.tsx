import { createContext, useContext, type ReactNode } from 'react';

export type PageHeaderBackAction = {
  label: string;
  to: string;
};

const defaultRegisterPageHeaderBackAction = () => {};

const PageHeaderBackActionContext = createContext<
  (action: PageHeaderBackAction | null) => void
>(defaultRegisterPageHeaderBackAction);

export function PageHeaderBackActionProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: (action: PageHeaderBackAction | null) => void;
}) {
  return (
    <PageHeaderBackActionContext.Provider value={value}>
      {children}
    </PageHeaderBackActionContext.Provider>
  );
}

export function useRegisterPageHeaderBackAction() {
  return useContext(PageHeaderBackActionContext);
}
