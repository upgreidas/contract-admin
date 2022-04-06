import { Injectable } from '@angular/core';
import { Contract } from '../interfaces/contract';
import { ethers } from 'ethers';

declare let window: any;

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  contracts: Contract[] = [];

  constructor() {
    const contractsData = localStorage.getItem('contracts');

    if (contractsData) {
      this.contracts = JSON.parse(contractsData);
    }
  }

  addContract(contract: Contract) {
    const lastContract = this.contracts[this.contracts.length - 1];

    contract.id = lastContract ? lastContract.id + 1 : 1;

    this.contracts.push(contract);

    this.updateLocalStorage();
  }

  updateContract(id: number, data: Contract) {
    const contract = this.contracts.find((c) => c.id === id);

    if (contract) {
      Object.assign(contract, data);
    }

    this.updateLocalStorage();
  }

  getContract(id: number) {
    return this.contracts.find((c) => c.id === id);
  }

  deleteContract(contract: Contract) {
    this.contracts = this.contracts.filter((c) => c !== contract);

    this.updateLocalStorage();
  }

  updateLocalStorage() {
    localStorage.setItem('contracts', JSON.stringify(this.contracts));
  }

  loadContract(contractEntry: Contract) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    return new ethers.Contract(
      contractEntry.address,
      contractEntry.abi,
      signer
    );
  }
}
