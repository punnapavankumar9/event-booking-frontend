import { Injectable, signal } from "@angular/core";
import { Toast } from "../types";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({ providedIn: "root" })
export class ToastService {
    _toast = new Subject<Toast>();

    toast$ = this._toast.asObservable();

    showToast(toast: Toast): void {
        this._toast.next(toast);
    }
}