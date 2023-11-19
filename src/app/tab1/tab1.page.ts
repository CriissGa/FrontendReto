import { Component, OnInit } from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AngularFireDatabase} from '@angular/fire/compat/database';
import { AngularFireObject } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
  
  
})
export class Tab1Page {
  numerocuentaAhorro: any;
  saldoAhorro: any;
  numerocuentaPlanilla: any;
  saldoPlanilla: any;

  cuentaAhorroRef: AngularFireObject<any>;

  constructor(private db: AngularFireDatabase) {
    this.cuentaAhorroRef = this.db.object('cuentas/ahorro');
    
    this.cuentaAhorroRef.valueChanges().subscribe((data: any) => {
      this.numerocuentaAhorro = data ? data.numerocuenta : null;
      this.saldoAhorro = data ? data.saldo : null;
    });

    this.db.object('cuentas/planilla').valueChanges().subscribe((data: any) => {
      this.numerocuentaPlanilla = data ? data.numerocuenta : null;
      this.saldoPlanilla = data ? data.saldo : null;
    });
  }

  realizarSuma() {
    if (this.saldoAhorro !== null) {
      this.cuentaAhorroRef.query.ref.transaction(data => {
        if (data !== null && typeof data === 'object') {
          // Asegurarse de que data.saldo existe y es un número antes de actualizar
          if (data.saldo !== undefined && typeof data.saldo === 'number') {
            data.saldo += 100;
          }
        }
        return data;
      })
      
    }
  }
}