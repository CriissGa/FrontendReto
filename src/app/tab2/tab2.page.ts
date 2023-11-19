import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  monto: number;
  cuentaOrigen: any;
  cuentaDestino: any;
  cuentas: string[] = ['ahorro', 'planilla']; // Lista de nombres de cuentas
  cuentaSeleccionada: string;
  numero: number; // Agregamos la propiedad 'numero'


  constructor(private db: AngularFireDatabase, private toastController: ToastController) {
    this.monto = 0;
    this.numero = 0; // Inicializamos 'numero'
    this.cuentaSeleccionada = this.cuentas[0]; // Establecemos la primera cuenta como la predeterminada
    this.cuentaDestino = this.cuentas[1];
    this.obtenerCuentas();
  
  }

  obtenerCuentas() {
    this.db.object(`cuentas/${this.cuentas[0]}`).valueChanges().subscribe((data: any) => {
      this.cuentaOrigen = data;
    });
  
    this.db.object(`cuentas/${this.cuentas[1]}`).valueChanges().subscribe((data: any) => {
      this.cuentaDestino = data;
    });
  }
 

  toggleCuenta(tipo: string) {
    if (tipo === 'cuentaOrigen') {
      // Lógica para mostrar/ocultar opciones de cuenta de origen
    } else if (tipo === 'cuentaDestino') {
      // Lógica para mostrar/ocultar opciones de cuenta destino
    }
  }
  
  seleccionarCuenta(cuenta: string, tipo: string) {
    if (tipo === 'cuentaOrigen') {
      this.cuentaSeleccionada = cuenta;
    } else if (tipo === 'cuentaDestino') {
      this.cuentaDestino = cuenta;
    }
  }

  seleccionarCuentaDestino(cuenta: string) {
    this.cuentaDestino = cuenta;
    // Lógica adicional si es necesaria
  }

  obtenerSaldo(cuenta: string): number {
    return this[cuenta]?.saldo || 0;
  }

  

  async realizarTransferencia() {
    this.monto = this.numero;
    if (!this.esNumeroPositivo(this.monto)) {
      this.mostrarToast('Ingrese un monto válido.');
      return;
    }

    if (this.monto > this.cuentaOrigen.saldo) {
      this.mostrarToast('Fondos insuficientes');
      return;
    }

    const resultadoTransferencia = await this.transferirDinero();
    if (resultadoTransferencia) {
      this.mostrarToast('Transferencia realizada con éxito');
    } else {
      this.mostrarToast('Error al realizar la transferencia');
    }
  }

  async transferirDinero(): Promise<boolean> {
    try {
      const cuentaOrigenRef = `cuentas/${this.cuentaSeleccionada}/saldo`;
      const cuentaDestinoRef = `cuentas/${this.cuentaDestino}/saldo`;

      await this.db.object(cuentaOrigenRef).query.ref.transaction(saldoActual => {
        if (saldoActual !== null && this.esNumeroPositivo(this.monto)) {
          return saldoActual - this.monto;
        } else {
          console.error('Error: El saldo actual es nulo o la cantidad no es válida.');
          return null;
        }
      });

      await this.db.object(cuentaDestinoRef).query.ref.transaction(saldoActual => {
        if (saldoActual !== null && this.esNumeroPositivo(this.monto)) {
          return saldoActual + this.monto;
        } else {
          console.error('Error: El saldo actual es nulo o la cantidad no es válida.');
          return null;
        }
      });

      return true; // Éxito en la transferencia
    } catch (error) {
      console.error('Error al realizar la transferencia:', error);
      return false; // Fallo en la transferencia
    }
  }

  private esNumeroPositivo(valor: number): boolean {
    return !isNaN(valor) && valor >= 0;
  }

  private async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }
}