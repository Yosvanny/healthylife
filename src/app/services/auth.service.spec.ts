import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario.model';
import { AuthService } from './auth.service';
import { mensajeDeError } from './mensaje-error';

// Simula la API: ninguna peticion llega a XAMPP.
const usuarioPrueba: Usuario = {
  id: 4,
  nombre: 'Usuario Prueba',
  email: 'prueba@ejemplo.com',
  metaAguaMl: 2000,
  fechaRegistro: '2026-10-28 23:58:46',
};
const tokenPrueba = 'a'.repeat(64);

describe('AuthService', () => {
  let servicio: AuthService;
  let api: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(AuthService);
    api = TestBed.inject(HttpTestingController);
    await Preferences.clear();
  });

  afterEach(() => {
    api.verify(); // Falla si quedo alguna peticion sin responder
  });

  it('inicia sesion y guarda el token en Preferences', async () => {
    const promesa = servicio.iniciarSesion('prueba@ejemplo.com', 'secreta123');

    const peticion = api.expectOne(`${environment.apiUrl}/login.php`);
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual({ email: 'prueba@ejemplo.com', password: 'secreta123' });
    peticion.flush({ ok: true, datos: { token: tokenPrueba, usuario: usuarioPrueba } });
    await promesa;

    expect(servicio.usuario()).toEqual(usuarioPrueba);
    expect(servicio.haySesion()).toBe(true);
    expect(servicio.obtenerToken()).toBe(tokenPrueba);
    expect((await Preferences.get({ key: 'healthylife_token' })).value).toBe(tokenPrueba);
  });

  it('si el login falla, no hay sesion y el mensaje es el de la API', async () => {
    const promesa = servicio.iniciarSesion('prueba@ejemplo.com', 'mala12345');

    api
      .expectOne(`${environment.apiUrl}/login.php`)
      .flush(
        { ok: false, error: 'Correo o contraseña incorrectos' },
        { status: 401, statusText: 'Unauthorized' },
      );

    const error = await promesa.catch((e: unknown) => e);
    expect(mensajeDeError(error)).toBe('Correo o contraseña incorrectos');
    expect(servicio.haySesion()).toBe(false);
  });

  it('cargarSesion devuelve false si no hay token guardado (sin llamar a la API)', async () => {
    expect(await servicio.cargarSesion()).toBe(false);
  });

  it('cargarSesion recupera la sesion con el token guardado', async () => {
    await Preferences.set({ key: 'healthylife_token', value: tokenPrueba });
    const promesa = servicio.cargarSesion();

    // Preferences.get es asincrono: se espera a que aparezca la peticion.
    const peticion = await vi.waitFor(() => api.expectOne(`${environment.apiUrl}/perfil.php`));
    expect(peticion.request.headers.get('Authorization')).toBe(`Bearer ${tokenPrueba}`);
    peticion.flush({ ok: true, datos: { usuario: usuarioPrueba } });

    expect(await promesa).toBe(true);
    expect(servicio.usuario()).toEqual(usuarioPrueba);
  });

  it('cargarSesion borra el token si la API lo rechaza (vencido)', async () => {
    await Preferences.set({ key: 'healthylife_token', value: tokenPrueba });
    const promesa = servicio.cargarSesion();

    const peticion = await vi.waitFor(() => api.expectOne(`${environment.apiUrl}/perfil.php`));
    peticion.flush(
      { ok: false, error: 'Tu sesión no es válida o expiró; inicia sesión de nuevo' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(await promesa).toBe(false);
    expect(servicio.haySesion()).toBe(false);
    expect((await Preferences.get({ key: 'healthylife_token' })).value).toBeNull();
  });

  it('cerrarSesion avisa a la API y borra el token local', async () => {
    const login = servicio.iniciarSesion('prueba@ejemplo.com', 'secreta123');
    api
      .expectOne(`${environment.apiUrl}/login.php`)
      .flush({ ok: true, datos: { token: tokenPrueba, usuario: usuarioPrueba } });
    await login;

    const promesa = servicio.cerrarSesion();
    const peticion = api.expectOne(`${environment.apiUrl}/logout.php`);
    expect(peticion.request.headers.get('Authorization')).toBe(`Bearer ${tokenPrueba}`);
    peticion.flush({ ok: true, datos: { mensaje: 'Sesión cerrada' } });
    await promesa;

    expect(servicio.haySesion()).toBe(false);
    expect(servicio.obtenerToken()).toBeNull();
    expect((await Preferences.get({ key: 'healthylife_token' })).value).toBeNull();
  });
});

describe('mensajeDeError', () => {
  it('sin respuesta del servidor (status 0) avisa del problema de conexion', () => {
    const error = new HttpErrorResponse({ status: 0 });
    expect(mensajeDeError(error)).toBe('No se pudo conectar con el servidor. Revisa tu conexión.');
  });

  it('un error que no es HTTP da un mensaje generico', () => {
    expect(mensajeDeError(new Error('x'))).toBe('Ocurrió un error inesperado. Intenta de nuevo.');
  });
});
