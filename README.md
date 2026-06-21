# 🚗 RUTA LIBRE — Guía de Lanzamiento

**Versión:** 2.0 — Lista para producción  
**Fecha:** Junio 2025  
**Para:** Tauramena, Casanare, Colombia 🇨🇴

---

## 📦 Archivos del proyecto

```
rutalibre/
├── index.html            → App principal (conductores + pasajeros)
├── admin-rutalibre.html  → Panel Super Admin
├── instalar.html         → Página de instalación por WhatsApp
├── sw.js                 → Service Worker v3 (cache offline + push)
├── manifest.json         → PWA manifest
├── icon-192.png          → Ícono 192×192 (Android home)
└── icon-512.png          → Ícono 512×512 (maskable PWA)
```

---

## 🚀 Cómo subir a GitHub Pages (gratis)

1. Ve a **github.com** → nuevo repositorio → nombre: `ruta-libre`
2. Sube todos los archivos (arrastra y suelta)
3. Ve a **Settings → Pages → Branch: main → / (root) → Save**
4. Tu app queda en: `https://TU-USUARIO.github.io/ruta-libre/`
5. Comparte `https://TU-USUARIO.github.io/ruta-libre/instalar.html` por WhatsApp

---

## 🔑 Acceso al panel admin

- URL: `https://TU-USUARIO.github.io/ruta-libre/admin-rutalibre.html`
- Login: **email + contraseña** (Firebase Auth)
- Para crear la cuenta admin, ve a Firebase Console → Authentication → Agregar usuario

---

## 📲 Cómo instalar en Android

1. Abre el enlace de `instalar.html` en Chrome
2. Toca **"Descargar APK"** (para APK nativa usar PWABuilder.com con la URL)
3. O desde Chrome: menú → **Agregar a pantalla de inicio**

### Crear APK real (sin costo)
1. Ve a **pwabuilder.com**
2. Pega la URL de tu GitHub Pages
3. Toca **Package for stores → Android → Download**
4. Comparte el `.apk` por WhatsApp directo

---

## 🍎 Cómo instalar en iPhone

1. Abre `instalar.html` en **Safari** (no Chrome)
2. Toca el botón compartir ⬆️
3. **"Agregar a pantalla de inicio"**
4. El ícono del carrito aparece como app

---

## ⚙️ Configuración inicial en el Admin

Al entrar al panel por primera vez:

### 1. Configuración básica
- **Tu WhatsApp:** número sin +57 (ej: 3114571322)
- **Mensaje de bienvenida:** texto que ven al contactarte
- **Créditos de bienvenida:** recomendado 10

### 2. Puntos de la vía
- Ya vienen 13 puntos por defecto (Tauramena → Yopal)
- Agrega o elimina según tu ruta real

### 3. Apariencia
- Elige el color del carrito 🚗
- Activa la franja de avisos si tienes mensajes urgentes

### 4. Publicidad
- Crea categorías (Tiendas, Mecánica, Restaurantes...)
- Agrega los primeros anuncios de negocios locales

---

## 🔥 Firebase — Proyecto configurado

```
Project: rutalibre-455cf
Región: us-central1
```

**Colecciones Firestore:**
- `config/plataforma` → configuración global
- `ciudades/{ciudad}/usuarios` → usuarios registrados
- `ciudades/{ciudad}/alertas` → alertas de retenes activas
- `ciudades/{ciudad}/puntos` → puntos de la vía
- `ciudades/{ciudad}/encomiendas` → encomiendas activas
- `ciudades/{ciudad}/solicitudes` → solicitudes de viaje
- `ciudades/{ciudad}/chat` → mensajes del chat
- `ciudades/{ciudad}/confLibre` → confirmaciones vía libre
- `ciudades/{ciudad}/anuncios` → negocios locales

---

## 👥 Roles de usuario

| Rol | Puede hacer |
|---|---|
| **Super Admin** | Todo desde el panel admin |
| **Conductor** | Reportar alertas, ver vía, encomiendas, chat, solicitudes |
| **Pasajero** | Ver alertas, solicitar viaje, enviar encomiendas |

---

## 📋 Checklist pre-lanzamiento

- [ ] Subir todos los archivos a GitHub Pages
- [ ] Crear cuenta admin en Firebase Auth
- [ ] Configurar WhatsApp y mensaje en el panel
- [ ] Agregar al menos 3 puntos de la vía reales
- [ ] Probar registro como conductor en el celular
- [ ] Probar reportar una alerta de prueba
- [ ] Instalar la app en el celular del admin
- [ ] Compartir `instalar.html` en el grupo de WhatsApp

---

## 🆘 Soporte técnico

Para modificaciones, nuevos módulos o expansión a otras ciudades, contactar al desarrollador que configuró el proyecto.

---

*RUTA LIBRE v2.0 — Hecho con ❤️ para los conductores de Tauramena, Casanare, Colombia*
