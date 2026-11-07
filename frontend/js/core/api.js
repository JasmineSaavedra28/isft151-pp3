/* ============================================================
   API y utilidades de sesión
   No modifica el backend: solo centraliza las llamadas existentes.
   ============================================================ */

const host = 'http://localhost:3000';

let currentUserId = null;
let authSessionToken = null;

const notificationIcons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
};

function notify(message, type = 'success', title = 'Información') {
    const region = document.getElementById('notificationRegion');
    if (!region) return;

    const activeDialog = document.getElementById('formModal');
    const inDialog = Boolean(activeDialog && activeDialog.open);

    const notification = document.createElement('div');
    notification.className = `notification ${type}${inDialog ? ' auth-inline-notification' : ''}`;

    const icon = document.createElement('span');
    icon.className = 'material-symbol notification-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = notificationIcons[type] || notificationIcons.info;

    const copy = document.createElement('div');
    copy.className = 'notification-copy';
    const heading = document.createElement('strong');
    heading.textContent = title;
    copy.append(heading, document.createTextNode(message));

    notification.append(icon, copy);

    if (inDialog) activeDialog.insertBefore(notification, activeDialog.firstChild);
    else region.appendChild(notification);

    window.setTimeout(function () {
        notification.remove();
    }, 5000);
}

window.alert = function (message) {
    notify(String(message).replace(/^Error:\s*/, ''), 'error', 'No se pudo completar');
};

class RPCWebAPIException extends Error {
    constructor(type, detail) {
        super(detail);
        this.name = 'RPCWebAPIException';
        this.type = type;
        this.detail = detail;
    }
}

async function computeSHA256(plainText) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(function (byte) {
            return byte.toString(16).padStart(2, '0');
        })
        .join('');
}

function normalizeHolidayDate(value) {
    const match = value.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!match) {
        throw new RPCWebAPIException(
            'BadRequest',
            `El feriado "${value}" debe tener el formato DD-MM-AAAA`
        );
    }
    return `${match[3]}-${match[2]}-${match[1]}`;
}

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'x-user-id': currentUserId,
        'Authorization': `Bearer ${authSessionToken}`,
        'x-api-version': '1.0'
    };
}

async function rpcFetch(path, body = {}) {
    const response = await fetch(host + path, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
    });

    if (response.status === 200) return response.json();

    if (response.status === 400) {
        throw new RPCWebAPIException('BadRequest', 'Error en los datos enviados');
    }

    if (response.status === 401 || response.status === 403) {
        authSessionToken = null;
        throw new RPCWebAPIException('AuthError', 'No autorizado o sesión expirada');
    }

    if (response.status === 422) {
        const err = await response.json().catch(function () {
            return {};
        });
        throw new RPCWebAPIException('DomainError', err.detail ? err.detail[0] : 'Error de validación');
    }

    throw new RPCWebAPIException('ServerError', 'Error interno del servidor');
}
