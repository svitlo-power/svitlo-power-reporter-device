import { useEffect, useState, type FC } from "react";
import { useAppSelector } from "../stores/store";
import { formatDuration } from "../utils";

export const Footer: FC = () => {
  const { appVer, fsVer, uptime: initialUptime, loading } = useAppSelector(state => state.app);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    if (!loading && initialUptime != null) {
      setUptime(initialUptime);
    }
  }, [initialUptime, loading]);

  useEffect(() => {
    if (loading || initialUptime == null) {
      return;
    }

    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, initialUptime]);

  return <footer style={{
      padding: '1.5rem',
      paddingBottom: '0.7rem',
      textAlign: 'center',
      color: 'var(--text-dimmed)',
      fontSize: '0.875rem'
    }}>
      {!loading && <div style={{ marginBottom: '0.5rem', opacity: 0.6 }}>
          v{appVer}/{fsVer}, up {formatDuration(uptime)}
        </div>}
      &copy; {new Date().getFullYear()} Svitlo-power. All rights reserved.
    </footer>;
}