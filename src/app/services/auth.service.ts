import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario.model';
import { RespuestaExito, SesionIniciada } from '../models/respuesta-api.model';

// Nombre con el que se guarda el token en el almacenamiento del dispositivo.
const CLAVE_TOKEN = 'healthylife_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private token: string | null = null;

  // Usuario con sesion iniciada (null si no hay sesion). Las pantallas lo leen con usuario().
  readonly usuario = signal<Usuario | null>(null);
  readonly haySesion = computed(() => this.usuario() !== null);

  // El interceptor (paso 8-C) lo usa para enviar "Authorization: Bearer <token>".
  obtenerToken(): string | null {
    return this.token;
  }

  async registrar(nombre: string, email: string, password: string): Promise<void> {
    const respuesta = await firstValueFrom(
      this.http.post<RespuestaExito<SesionIniciada>>(`${environment.apiUrl}/registro.php`, {
        nombre,
        email,
        password,
      }),
    );
    await this.guardarSesion(respuesta.datos);
  }

  async iniciarSesion(email: string, password: string): Promise<void> {
    const respuesta = await firstValueFrom(
      this.http.post<RespuestaExito<SesionIniciada>>(`${environment.apiUrl}/login.php`, {
        email,
        password,
      }),
    );
    await this.guardarSesion(respuesta.datos);
  }

  // Al abrir la app: si hay un token guardado, pide el perfil para comprobar que sigue vigente.
  // Devuelve true si la sesion es valida.
  async cargarSesion(): Promise<boolean> {
    if (this.usuario()) {
      return true;
    }

    const { value } = await Preferences.get({ key: CLAVE_TOKEN });
    if (!value) {
      return false;
    }

    this.token = value;
    try {
      const respuesta = await firstValueFrom(
        this.http.get<RespuestaExito<{ usuario: Usuario }>>(`${environment.apiUrl}/perfil.php`, {
          headers: { Authorization: `Bearer ${value}` },
        }),
      );
      this.usuario.set(respuesta.datos.usuario);
      return true;
    } catch {
      // Token vencido o servidor no disponible: se pide iniciar sesion de nuevo.
      // (En el paso 15-A se distinguira "sin conexion" para no cerrar la sesion.)
      await this.borrarSesionLocal();
      return false;
    }
  }

  async cerrarSesion(): Promise<void> {
    if (this.token) {
      try {
        await firstValueFrom(
          this.http.post(`${environment.apiUrl}/logout.php`, null, {
            headers: { Authorization: `Bearer ${this.token}` },
          }),
        );
      } catch {
        // Aunque la API falle, la sesion se cierra en el dispositivo.
      }
    }
    await this.borrarSesionLocal();
  }

  private async guardarSesion(sesion: SesionIniciada): Promise<void> {
    this.token = sesion.token;
    this.usuario.set(sesion.usuario);
    await Preferences.set({ key: CLAVE_TOKEN, value: sesion.token });
  }

  private async borrarSesionLocal(): Promise<void> {
    this.token = null;
    this.usuario.set(null);
    await Preferences.remove({ key: CLAVE_TOKEN });
  }
}
