type Deposit = {
  id: string;
  amount: number;
  note?: string;
  createdAt: string;
};

type Goal = {
  id: string;
  name: string;
  target?: number;
  deadline?: string;
  createdAt: string;
  deposits: Deposit[];
};

export type { Deposit, Goal };