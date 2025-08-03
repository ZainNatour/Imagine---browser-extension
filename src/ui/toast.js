import { toast } from 'sonner';

export const notify = (msg) => {
  try {
    toast.success(msg);
  } catch {
    // ignore outside browser environments
  }
};
