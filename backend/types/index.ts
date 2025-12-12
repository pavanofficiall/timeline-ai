// Global backend types will be placed here
export type CaseEvent = {
  date: string;
  title: string;
  description: string;
  parties: string[];
  type?: string;
  payment?: {
    amount?: string;
    currency?: string;
    sender?: string;
    receiver?: string;
  };
};

