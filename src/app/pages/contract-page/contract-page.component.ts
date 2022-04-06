import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ethers } from 'ethers';
import { ABI } from 'src/app/interfaces/abi';
import { Contract } from 'src/app/interfaces/contract';
import { ContractService } from 'src/app/services/contract.service';

declare let window: any;

@Component({
  selector: 'app-contract-page',
  templateUrl: './contract-page.component.html',
  styleUrls: ['./contract-page.component.scss'],
})
export class ContractPageComponent implements OnInit {
  contractEntry?: Contract;

  selectedFunction = '';

  abiForm?: FormGroup;

  abi?: ABI;

  ethereum? = window.ethereum;

  account?: string;

  contract?: ethers.Contract;

  error?: any;

  response?: any;

  executing = false;

  accountsChangedHandler = (accounts: string[]) => {
    window.location.reload();
  };

  chainChangedHandler = (accounts: string[]) => {
    window.location.reload();
  };

  constructor(
    private contractService: ContractService,
    private activatedRoute: ActivatedRoute
  ) {
    const id = parseInt(this.activatedRoute.snapshot.params.id);

    this.contractEntry = this.contractService.getContract(id);

    if (this.ethereum) {
      if (this.contractEntry) {
        this.ethereum
          .request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts[0]) {
              this.account = accounts[0];
              this.contract = this.contractService.loadContract(
                this.contractEntry as Contract
              );
            }
          })
          .catch((error: any) => {});
      }

      this.ethereum.on('accountsChanged', this.accountsChangedHandler);
      this.ethereum.on('chainChanged', this.chainChangedHandler);
    }
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    if (this.ethereum) {
      this.ethereum.removeListener(
        'accountsChanged',
        this.accountsChangedHandler
      );

      this.ethereum.removeListener('chainChanged', this.chainChangedHandler);
    }
  }

  connectWallet() {
    this.ethereum
      .request({ method: 'eth_requestAccounts' })
      .then((accounts: string[]) => {})
      .catch((error: any) => {});
  }

  onFunctionChange() {
    this.error = undefined;
    this.response = undefined;

    this.abi = this.contractEntry?.abi.find(
      (f) => f.name === this.selectedFunction
    );

    if (!this.abi) {
      this.abiForm = undefined;
      return;
    }

    const controls: any = {};

    for (const input of this.abi.inputs) {
      controls[input.name] = new FormControl('');
    }

    if (this.abi.stateMutability === 'payable') {
      controls['ethValue'] = new FormControl('0', [Validators.required]);
    }

    this.abiForm = new FormGroup(controls);
  }

  onSubmit() {
    if (!this.abiForm || !this.contract || !this.abi) {
      return;
    }

    if (this.abiForm.invalid) {
      return;
    }

    this.error = undefined;
    this.response = undefined;

    const args = [];
    const options: any = {};
    const formValue = Object.assign({}, this.abiForm.value);

    if (this.abi.stateMutability === 'payable') {
      try {
        options.value = ethers.utils.parseEther(formValue.ethValue);
        delete formValue.ethValue;
      } catch (e) {
        this.error = e;
        return;
      }
    }

    for (const input of this.abi.inputs) {
      args.push(formValue[input.name]);
    }

    this.executing = true;

    this.contract[this.selectedFunction](...args, options)
      .then((res: any) => {
        if (res.hash) {
          this.response = `Transaction: ${res.hash}`;
        } else {
          this.response = `Response: ${res}`;
        }

        this.executing = false;
      })
      .catch((e: any) => {
        this.error = e;
        this.executing = false;
      });
  }
}
