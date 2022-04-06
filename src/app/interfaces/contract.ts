import { ABI } from './abi';

export interface Contract {
  id: number;
  name: string;
  address: string;
  abi: ABI[];
}
