import type { FC } from "react";
import { useAppSelector } from "../stores/store";

export const Footer: FC = () => {
  const { appVer, fsVer, loading } = useAppSelector(state => state.app);

  return <footer style={{
      padding: '1.5rem',
      paddingBottom: '0.7rem',
      textAlign: 'center',
      color: 'var(--text-dimmed)',
      fontSize: '0.875rem'
    }}>
      {!loading && <div style={{ marginBottom: '0.5rem', opacity: 0.6 }}>v{appVer}/{fsVer}</div>}
      &copy; {new Date().getFullYear()} Svitlo-power. All rights reserved.
    </footer>;
}