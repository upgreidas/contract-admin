import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ABI } from 'src/app/interfaces/abi';
import { ContractService } from 'src/app/services/contract.service';

@Component({
  selector: 'app-contract-dialog',
  templateUrl: './contract-dialog.component.html',
  styleUrls: ['./contract-dialog.component.scss'],
})
export class ContractDialogComponent implements OnInit {
  @ViewChild('fileInput') fileInput?: ElementRef;

  contractForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    abi: new FormControl(undefined, [Validators.required]),
  });

  submitted = false;

  artifactFile?: File;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<ContractDialogComponent>,
    private contractService: ContractService
  ) {
    if (this.data.contract) {
      const { name, address, abi } = this.data.contract;

      this.contractForm.setValue({ name, address, abi });
    }
  }

  ngOnInit(): void {}

  saveContract() {
    this.submitted = true;

    if (!this.contractForm.valid) {
      return;
    }

    if (this.data.contract) {
      this.contractService.updateContract(
        this.data.contract.id,
        this.contractForm.value
      );
    } else {
      this.contractService.addContract(this.contractForm.value);
    }

    this.dialog.close();
  }

  triggerFileInput() {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.click();
      (this.contractForm.get('abi') as FormControl).markAsTouched();
    }
  }

  onFileSelected(event: Event) {
    const element = event.target as HTMLInputElement;
    const files: FileList | null = element.files;

    if (!files || !files[0]) {
      this.clearAbi();
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent) => {
      try {
        let { abi } = JSON.parse(reader.result as string);

        abi = abi.filter((n: ABI) => n.type === 'function');

        if (abi) {
          this.artifactFile = files[0];
          this.contractForm.patchValue({ abi });
          this.contractForm.get('abi')?.setErrors(null);
        } else {
          this.clearAbi();
          this.contractForm.get('abi')?.setErrors({ invalidFormat: true });
        }
      } catch (e) {
        this.clearAbi();
        this.contractForm.get('abi')?.setErrors({ invalidFormat: true });
      }
    };
    reader.readAsText(files[0]);
  }

  clearAbi() {
    this.artifactFile = undefined;
    this.contractForm.patchValue({ abi: undefined });
  }

  hasError(controlName: string, code: string) {
    const control = this.contractForm.get(controlName);

    if (!control) {
      return false;
    }

    return (this.submitted || control.touched) && control.hasError(code);
  }
}
