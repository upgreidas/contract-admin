import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContractDialogComponent } from 'src/app/components/contract-dialog/contract-dialog.component';
import { DeleteDialogComponent } from 'src/app/components/delete-dialog/delete-dialog.component';
import { Contract } from 'src/app/interfaces/contract';
import { ContractService } from 'src/app/services/contract.service';

@Component({
  selector: 'app-index-page',
  templateUrl: './index-page.component.html',
  styleUrls: ['./index-page.component.scss'],
})
export class IndexPageComponent implements OnInit {
  constructor(
    public contractService: ContractService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  openContractDialog(contract?: Contract) {
    this.dialog.open(ContractDialogComponent, {
      data: {
        contract,
      },
    });
  }

  openDeleteDialog(contract: Contract) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {
        contract,
      },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.contractService.deleteContract(contract);
      }
    });
  }
}
