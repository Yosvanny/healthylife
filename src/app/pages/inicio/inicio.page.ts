import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonProgressBar,
  IonBadge,
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  moonOutline,
  waterOutline,
  restaurantOutline,
  walkOutline,
  hourglassOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  imports: [
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonProgressBar,
    IonBadge,
    IonIcon,
  ],
})
export class InicioPage {
  fecha = new Date();

  // ⚠️ DATOS DE EJEMPLO: se reemplazarán por los datos reales de la API
  // cuando implementemos la base de datos y los servicios.
  esEjemplo = true;
  resumen = {
    suenoMinutos: 450,
    aguaMl: 1250,
    metaAguaMl: 2000,
    comidasRegistradas: 2,
    caloriasEstimadas: 1350,
    actividadMinutos: 30,
    sedentarioMinutos: 390,
  };

  constructor() {
    addIcons({ moonOutline, waterOutline, restaurantOutline, walkOutline, hourglassOutline });
  }

  // Valor entre 0 y 1 para la barra de progreso (máximo 1, aunque se supere la meta).
  get progresoAgua(): number {
    return Math.min(this.resumen.aguaMl / this.resumen.metaAguaMl, 1);
  }

  // Porcentaje real respecto a la meta (puede pasar de 100).
  get porcentajeAgua(): number {
    return Math.round((this.resumen.aguaMl / this.resumen.metaAguaMl) * 100);
  }

  // Convierte minutos a texto: 450 -> "7 h 30 min".
  formatearMinutos(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    return `${horas} h ${resto} min`;
  }
}