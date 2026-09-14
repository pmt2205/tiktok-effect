import { ReactNode } from 'react';

/** Keeps designer children mounted while server settings are persisted. */
export default function SettingsDraftBoundary({ revision, children }: { revision: string; children: ReactNode }) {
  void revision;
  return children;
}
