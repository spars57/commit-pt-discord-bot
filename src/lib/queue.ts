type Task = () => Promise<void>;

interface QueueEntry {
  task: Task;
  retries: number;
}

const MAX_RETRIES = 3;
const queue: QueueEntry[] = [];
let processing = false;

async function processQueue(): Promise<void> {
  if (processing) return;
  processing = true;

  while (queue.length > 0) {
    const entry = queue[0];

    try {
      await entry.task();
      queue.shift();
    } catch (err: unknown) {
      const retryAfter = extractRetryAfter(err);

      if (retryAfter > 0 && entry.retries < MAX_RETRIES) {
        entry.retries++;
        await sleep(retryAfter);
      } else {
        queue.shift();
        throw err;
      }
    }
  }

  processing = false;
}

function extractRetryAfter(err: unknown): number {
  if (
    err !== null &&
    typeof err === 'object' &&
    'data' in err &&
    err.data !== null &&
    typeof err.data === 'object' &&
    'retry_after' in err.data &&
    typeof err.data.retry_after === 'number'
  ) {
    return err.data.retry_after * 1000;
  }
  return 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function enqueue(task: Task): void {
  queue.push({ task, retries: 0 });
  processQueue().catch(() => {});
}
