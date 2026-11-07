/* ============================================================
   Calendario académico
   ============================================================ */

function initCalendarHandlers(menu) {
    document.getElementById('btnNewCalendar').onclick = async function () {
        const data = await showFormModal('Configurar Calendario Académico', [
            { name: 'academicYear', label: 'Ciclo lectivo', type: 'number' },
            { name: 'startDate', label: 'Fecha de inicio', type: 'date' },
            { name: 'endDate', label: 'Fecha de fin', type: 'date' },
            { name: 'holidays', label: 'Feriados (DD-MM-AAAA separados por coma)', placeholder: '25-05-2026, 09-07-2026' }
        ]);
        if (!data) return;

        data.academicYear = Number(data.academicYear);

        try {
            data.holidays = data.holidays.split(',')
                .map(function (date) {
                    return date.trim();
                })
                .filter(Boolean)
                .map(normalizeHolidayDate);

            const res = await rpcFetch('/newAcademicCalendar', data);
            menu.printResult({ message: 'Calendario configurado correctamente', calendario: res });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };

    document.getElementById('btnListCalendars').onclick = async function () {
        try {
            const calendars = await rpcFetch('/listAcademicCalendars');
            menu.printResult({ calendarios: calendars });
        } catch (e) {
            alert(`Error: ${e.detail}`);
        }
    };
}
