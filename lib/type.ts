import type {Loan} from "./models";

export type LoanUpdate = Omit<Partial<Loan>, 'id'>;
