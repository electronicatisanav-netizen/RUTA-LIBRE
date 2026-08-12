# RUTA LIBRE — Guía de mantenimiento y despliegue

Esta guía es para que puedas seguir agregando funciones y corrigiendo cosas
en el futuro **sin volver a romper la app en producción**. Guardala en la
raíz del repositorio.

---

## 1. Qué se corrigió en esta ronda (11 ago 2026)

| # | Problema | Causa real | Efecto para el usuario |
|---|----------|------------|-------------------------|
| 1 | El registro se quedaba trabado en la pantalla de Privacidad | Las reglas de Firestore tenían fecha de expiración (`timestamp.date(2026,7,7)`) y ya habían vencido — Firestore rechazaba **toda** lectura/escritura | El usuario llenaba sus datos, tocaba "Entrar" y no pasaba nada, sin ningún mensaje |
| 2 | El error de Firestore no se veía en pantalla | El código escribía el mensaje de error en un `<div id="e3">` que pertenece al paso anterior del formulario (oculto en ese momento) | Imposible diagnosticar el problema desde el celular del usuario |
| 3 | Posible caída silenciosa en `mostrarApp()` | `document.getElementById('btnInstalar')` sin verificar que el elemento existiera (no existe en el HTML) | Si ocurría, sumaba al síntoma del punto 1 |
| 4 | El pasajero nunca recibía el aviso "¡viaje aceptado!" ni "¡encomienda tomada!" | Las funciones `escucharMisSolicitudes()` y `escucharMisEncomiendas()` existían en el código pero nunca se llamaban desde ningún lado | Notificación importante ausente para el rol pasajero |
| 5 | No existía `sw.js` en el paquete subido | El Service Worker (offline, sync en segundo plano) nunca se generó/subió | Sin funcionamiento sin conexión ni sincronización automática de alertas pendientes |

**Archivos que cambiaron:** `index.html` (correcciones 2, 3, 4), `sw.js` (nuevo,
corrección 5). `admin-rutalibre.html`, `instalar.html`, `manifest.json` e
íconos quedaron igual — se revisaron y no tenían errores.
**Fuera del código:** las Reglas de Firestore (corrección 1) se cambian
desde la consola de Firebase, no desde un archivo del repo.

---

## 2. Reglas de Firestore — dónde viven y cómo evitar que vuelvan a vencer

Firebase, quiera hacerte esto de nuevo: cada vez que creás un proyecto nuevo,
te ofrece reglas de "modo de prueba" que **expiran a los 30 días**. Ya
reemplazamos esas reglas por unas permanentes (`firestore.rules`, incluido
en este paquete). Para aplicarlas:

1. Firebase Console → proyecto `rutalibre-455cf` → **Firestore Database** →
   pestaña **Reglas**.
2. Pegá el contenido completo de `firestore.rules`.
3. **Publicar**.

Estas reglas **no tienen fecha de expiración**, así que no hace falta que
vuelvas a esto salvo que quieras cambiar quién puede leer/escribir qué.

Si en el futuro agregás una colección nueva en Firestore (por ejemplo
`ciudades/{ciudad}/promociones`), **acordate de agregarla también a las
reglas** — por defecto, cualquier colección no listada queda bloqueada
(la última regla del archivo lo garantiza). Si olvidás agregarla, esa
colección nueva va a fallar exactamente igual que el bug que acabamos de
corregir — con el error ahora sí visible en pantalla gracias a la corrección 2.

---

## 3. Cómo actualizar la app sin romperla (flujo recomendado)

1. **Nunca edites directo en GitHub desde el navegador para cambios grandes.**
   Cloná el repo o descargá el zip, probá local, y recién después subí.
2. **Probá localmente antes de publicar.** Con Python:
   ```bash
   python3 -m http.server 8080
   ```
   Abrí `http://localhost:8080` en el navegador. Firestore funciona igual
   desde localhost (las reglas no distinguen el origen).
3. **Cada vez que cambies `index.html`, `instalar.html` o `manifest.json`,
   subí también el número de versión en `sw.js`:**
   ```js
   const CACHE_VERSION = 'rutalibre-v7'; // v6 -> v7
   ```
   Esto es lo que hace que los celulares con la app ya instalada bajen la
   versión nueva solos. Si te olvidás de este paso, la gente puede quedarse
   viendo una versión vieja en caché por tiempo indefinido.
4. **Subí todo junto, en un solo commit**, para que no quede una versión a
   medias servida por GitHub Pages mientras subís archivo por archivo.
5. Esperá 1-2 minutos a que GitHub Pages reconstruya.
6. **Probá en un celular real** (Android y iPhone), como conductor y como
   pasajero, el flujo completo: registro → ver alertas → reportar retén →
   reportar patrulla → pedir viaje / encomienda → tomarlo del otro lado.
7. Si ya tenías la app instalada, cerrala del todo (quitarla de apps
   recientes) y volvé a abrirla para que tome la versión nueva.

### Checklist rápido antes de cada publicación
- [ ] Subiste el número de `CACHE_VERSION` en `sw.js`
- [ ] Probaste el registro de un usuario nuevo (conductor y pasajero)
- [ ] Si tocaste una colección de Firestore, revisaste `firestore.rules`
- [ ] Probaste en un celular real, no solo en la compu
- [ ] Revisaste la consola del navegador (F12) por errores en rojo

---

## 4. Cómo diagnosticar un problema nuevo

Con la corrección del punto 2 de la tabla de arriba, **cualquier error de
registro ahora se muestra en pantalla** (como texto rojo y como una
notificación flotante). Si un usuario te reporta algo, pedile que:

1. Te diga el mensaje exacto de error que aparece (ya no queda invisible).
2. O, si sabe hacerlo: que abra el navegador → menú → herramientas de
   desarrollador → pestaña "Consola" → te mande captura de lo que dice en rojo.

Errores más comunes que vas a ver ahí y qué significan:
- `permission-denied` → las reglas de Firestore están bloqueando esa
  operación. Revisá que la colección esté permitida en `firestore.rules`.
- `unavailable` → el celular del usuario no tiene internet en ese momento.
- `Cannot set properties of null` (o similar) → un `id` de HTML que el
  JavaScript busca no existe en la página. Buscá ese `id` en el archivo con
  Ctrl+F para confirmar si falta.

---

## 5. Ideas para cuando el proyecto siga creciendo

Estas no son urgentes, son para cuando tengas tiempo:

- **Separar el proyecto en varios archivos** (hoy todo el JavaScript vive
  adentro de `index.html` en un solo bloque gigante). Es más difícil de
  mantener a medida que crece. Se puede dividir en módulos (`firebase.js`,
  `ui.js`, `alertas.js`, etc.) sin cambiar cómo funciona la app.
- **Panel admin con roles**: hoy cualquier cuenta que inicie sesión en
  `admin-rutalibre.html` tiene acceso total. Si en algún momento das acceso
  a más de una persona, conviene diferenciar permisos (solo lectura,
  moderador, admin total) usando *custom claims* de Firebase Auth.
- **Respaldos de Firestore**: activá backups automáticos programados desde
  Firebase Console → Firestore Database → Backups, así no dependés de
  exportar manualmente si algo sale mal.
- **Monitoreo de cuota**: en Firebase Console → Uso y facturación, fijate
  cada tanto que las lecturas/escrituras de Firestore no se disparen —
  con la app creciendo en usuarios, es la métrica que más rápido puede
  subir de costo.

---

## 6. Contenido de este paquete

| Archivo | Qué es | ¿Se modificó hoy? |
|---|---|---|
| `index.html` | App principal (conductores/pasajeros) | ✅ Sí |
| `admin-rutalibre.html` | Panel de administración | No — revisado, sin errores |
| `instalar.html` | Página de instrucciones de instalación | No — revisado, sin errores |
| `manifest.json` | Configuración PWA (ícono, nombre, colores) | No |
| `sw.js` | Service Worker (offline + sync) | ✅ Nuevo — no existía en el repo |
| `icon-192.png` / `icon-512.png` | Íconos de la app | No |
| `firestore.rules` | Reglas de seguridad de Firestore | ✅ Nuevo — pegar en Firebase Console |
| `MANTENIMIENTO.md` | Este documento | ✅ Nuevo |
