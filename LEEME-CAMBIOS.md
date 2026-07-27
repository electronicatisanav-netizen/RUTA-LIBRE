# RUTA LIBRE — Paquete corregido y listo para GitHub

## Cómo subir esto a tu repositorio
1. Reemplaza en tu repo (rama principal, la que usa GitHub Pages) estos archivos por los de esta carpeta:
   `index.html`, `admin-rutalibre.html`, `instalar.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`.
2. Sube (commit + push) todo junto, en un solo commit si puedes.
3. Espera 1-2 minutos a que GitHub Pages reconstruya.
4. **Importante:** si ya tenías la app instalada en un celular, es posible que debas cerrarla del todo (quitarla de apps recientes) y volver a abrirla, o incluso desinstalar y reinstalar, para que tome la versión nueva. Ya dejé el Service Worker con una versión de caché nueva (`rutalibre-v5`) precisamente para forzar esa actualización automáticamente en la mayoría de los casos.

## Bugs reales que encontré y corregí

1. **Error de sintaxis que rompía TODA la app.** Un backtick (`` ` ``) de cierre estaba mal puesto en la función que arma el historial de viajes. Como todo el código vive en un solo `<script type="module">`, ese error de sintaxis impedía que se ejecutara *cualquier* línea de JavaScript — la app no funcionaba realmente más allá de lo visual estático. Este era, con certeza, el problema más grave.

2. **El botón de "pasajeros que se anuncian" y el de "encomiendas" (los flotantes del conductor) siempre aparecían vacíos.** Existían dos sistemas distintos para mostrar esa información: uno viejo (el panel deslizable / drawer) que nunca se conectó a datos reales de Firebase, y uno nuevo que sí funciona (las pantallas completas de Transporte/Encomiendas). El botón flotante abría el sistema viejo y roto. Ya lo conecté para que cargue los datos reales de Firestore cada vez que se abre.

3. **Al tomar una encomienda desde ese botón, se cruzaban los datos:** el nombre del remitente y la descripción del paquete quedaban invertidos en el mensaje de WhatsApp (por una función duplicada con el orden de parámetros distinto). Corregido.

4. **Código muerto/duplicado** dejado por ediciones anteriores: un modal de confirmación completo que nunca se usaba (con un botón que llamaba a una función inexistente), reglas de CSS repetidas y en conflicto entre sí (rompían la animación del aviso de confirmación), y una función de "avisar llegada" duplicada. Todo esto quedó limpio.

## Función nueva que pediste

**🚓 Patrulla en movimiento**, en el modal de "Reportar novedad" del conductor (pantalla La Vía):
- Nuevo botón junto a Retén / Accidente / Otra novedad.
- Al elegirlo aparece un campo: **"¿Hacia dónde se dirige la patrulla?"**
- Se guarda y se muestra en las tarjetas de alertas, en el círculo grande de estado de la vía, en las notificaciones y en el aviso por voz (con su propio color morado para diferenciarla).
- De paso, corregí un problema relacionado: si la única alerta activa era de un tipo "informativo" (como esta o "Otra novedad"), el círculo grande de estado se quedaba pegado con la información vieja porque el código no tenía un caso para eso. Ahora sí lo maneja.

5. **Las alertas SOS (emergencias) no se destacaban.** Cuando un conductor enviaba un SOS, la tarjeta de alerta y el círculo grande de estado de la vía la mostraban igual que cualquier "novedad" genérica, sin resaltarla en rojo ni con su propio texto. Ya la puse con máxima prioridad visual (por encima incluso de un retén) ya que es literalmente una emergencia.

## ⚠️ Sobre "APK instalable en Android y Apple"
Esto es una **PWA** (Progressive Web App), no un `.apk` nativo compilado. Funciona como app real: se "instala" desde el navegador (Chrome en Android, Safari en iPhone) con el botón "Agregar a pantalla de inicio" / "Instalar", queda con ícono propio, abre en pantalla completa sin barra de navegador, y funciona sin conexión gracias al Service Worker. Es la forma más simple, económica y compatible de tener "una app" para ambos sistemas operativos sin pasar por las tiendas de aplicaciones — y es exactamente cómo ya la tenías planteada en tu documentación (`instalar.html` ya explica este proceso a los usuarios).

Si en algún momento quieres un `.apk` real para subir a la Play Store, el siguiente paso sería envolver esta misma PWA con **PWABuilder** (gratis, de Microsoft) o **Capacitor** — herramientas que generan el instalable nativo a partir de este mismo código, sin tener que reescribir nada. Puedo guiarte en ese proceso si llegas a necesitarlo, pero no es algo que se genere aquí en el chat (requiere Android Studio / cuenta de desarrollador).

## Sobre los otros dos archivos que mencionaste al inicio
`ORDEN_DE_PUNTOS.docx` y `rutalibre_inventario.svg` nunca llegaron con contenido a ninguna de las subidas (revisé todos los zips y no están en ninguno). Si los necesitas incluidos en la revisión, tendrías que volver a subirlos.

## Lo que NO toqué (y por qué)
El panel de administración (`admin-rutalibre.html`) no tenía errores — lo revisé a fondo y quedó igual. No rediseñé visualmente la app porque el diseño en sí no estaba roto; el problema era el error de sintaxis y la lógica muerta descritos arriba. Si después de subir esto sigues viendo algo que no cuadra, dime exactamente qué botón/pantalla y lo reviso puntual.

## Recomendación
Antes de subir a producción, pruébalo primero desde GitHub Pages en un celular real (Android y iPhone) como conductor y como usuario, siguiendo el flujo completo: registro → pantalla 1/2 → reportar retén → reportar patrulla → ver pasajeros/encomiendas → tomar uno.
