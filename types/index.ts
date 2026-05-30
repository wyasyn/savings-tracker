type Deposit = {
  id: string;
  amount: number;
  note?: string;
  /** Channel the money came through: "bank" | "mobile_money" | "sacco" | "cash". */
  channel?: string;
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