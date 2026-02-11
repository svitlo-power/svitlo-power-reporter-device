export async function pollAndRedirect(
  hostname: string,
  maxAttempts: number = 60,
  intervalMs: number = 2000
): Promise<void> {
  let attempts = 0;

  const poll = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`http://${hostname}/api/ping`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeoutId);

      return response.ok || response.status >= 400;
    } catch (error) {
      return false;
    }
  };

  return new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      attempts++;

      const isReachable = await poll();

      if (isReachable) {
        clearInterval(intervalId);
        window.location.href = `http://${hostname}`;
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(intervalId);
        reject(new Error(`Failed to reach ${hostname} after ${maxAttempts} attempts`));
      }
    }, intervalMs);
  });
}
