import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

export interface InfoBarOptions {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  closeLabel?: string;
  actionCallback?: () => void;
  autoClose?: boolean;
  horizontalPosition?: 'center' | 'start' | 'end' | 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
}


@Injectable({ providedIn: 'root' })
export class InfoBarService {
  constructor(private snackbar: MatSnackBar) {}

  show(options: InfoBarOptions) {
    const {
      message,
      type = 'info',
      duration = 4000,
      closeLabel = 'Ok',
      actionCallback,
      autoClose = true,
      horizontalPosition = 'center',
      verticalPosition = 'top'
    } = options;

    const config = {
      duration: autoClose ? duration : undefined,
      panelClass: ['info-bar', `info-bar-${type}`],
      horizontalPosition,
      verticalPosition,
      data: { message }
    };
    const snackBarRef = this.snackbar.open(message, closeLabel, config);

    if (actionCallback) {
      snackBarRef.onAction().subscribe(() => actionCallback());
    }
  }

  dismiss() {
    this.snackbar.dismiss();
  }
}