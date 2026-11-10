

const dataLabels = {
    userId: 'Usuario',
    username: 'Nombre de usuario',
    role: 'Rol',
    status: 'Estado',
    studentId: 'Alumno',
    name: 'Nombre',
    surname: 'Apellido',
    dni: 'DNI',
    courseId: 'Curso',
    professorId: 'Docente',
    startDate: 'Inicio',
    endDate: 'Fin',
    academicYear: 'Ciclo lectivo',
    holidays: 'Feriados',
    academicCalendarId: 'Calendario',
    success: 'Resultado',
    message: 'Mensaje',
    present: 'Presentes',
    absent: 'Ausentes',
    late: 'Tardes',
    attendancePercentage: 'Asistencia'
};

const badgeVariants = {
    'Habilitado': 'badge-success',
    'Deshabilitado': 'badge-danger',
    'Activo': 'badge-success',
    'Inactivo': 'badge-neutral',
    'Sí': 'badge-success',
    'No': 'badge-neutral',
    'Administrador': 'badge-info',
    'Docente': 'badge-info',
    'Preceptor': 'badge-neutral',
    'Presente': 'badge-success',
    'Ausente': 'badge-danger',
    'Tarde': 'badge-warning',
    'Retiro': 'badge-warning',
    'EN ORDEN': 'badge-success'
};

function formatDataValue(value) {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value.split('-').reverse().join('/');
    }
    if (value === 'enabled') return 'Habilitado';
    if (value === 'disabled') return 'Deshabilitado';
    return String(value);
}

function createBadge(text) {
    const badge = document.createElement('span');
    badge.className = `badge ${badgeVariants[text] || 'badge-neutral'}`;
    badge.textContent = text;
    return badge;
}

function createDataTable(rows) {
    const wrap = document.createElement('div');
    wrap.className = 'report-table-wrap';

    const table = document.createElement('table');
    table.className = 'report-table';

    const columns = Array.from(new Set(rows.flatMap(function (row) {
        return Object.keys(row || {}).filter(function (key) {
            if (key.toLowerCase() === 'userid' || key.toLowerCase().includes('id')) return false;
            return typeof row[key] !== 'object' || row[key] === null;
        });
    })));

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    columns.forEach(function (column) {
        const cell = document.createElement('th');
        cell.textContent = dataLabels[column] || column.replace(/([A-Z])/g, ' $1').replace(/^./, function (letter) {
            return letter.toUpperCase();
        });
        headerRow.appendChild(cell);
    });
    thead.appendChild(headerRow);

    const tbody = document.createElement('tbody');
    rows.forEach(function (row) {
        const tableRow = document.createElement('tr');
        columns.forEach(function (column) {
            const cell = document.createElement('td');
            const text = formatDataValue(row[column]);
            if (badgeVariants[text]) cell.appendChild(createBadge(text));
            else cell.textContent = text;
            tableRow.appendChild(cell);
        });
        tbody.appendChild(tableRow);
    });

    table.append(thead, tbody);
    wrap.appendChild(table);
    return wrap;
}

function createElement(tagName, options = {}) {
    const element = document.createElement(tagName);
    const reserved = ['id', 'className', 'textContent', 'style'];

    if (options.id) element.id = options.id;
    if (options.className) element.className = options.className;
    if (options.textContent !== undefined && options.textContent !== null) {
        element.textContent = options.textContent;
    }
    if (options.style) element.style.cssText = options.style;

    Object.keys(options).forEach(function (key) {
        if (reserved.includes(key) || options[key] === undefined || options[key] === null) return;
        element.setAttribute(key, options[key] === true ? '' : String(options[key]));
    });

    return element;
}

function createButton(id, text, isDanger = false) {
    return createElement('button', {
        id,
        className: isDanger ? 'danger' : '',
        textContent: text
    });
}
