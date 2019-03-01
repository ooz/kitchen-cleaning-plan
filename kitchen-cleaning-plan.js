import { HOLIDAYS } from './holidays.js';
import { shuffle } from './deps.js';

function normalizePeople(parameters) {
    const early = Array.from(new Set(splitArrayString(parameters.early))).filter(p => p !== '')
    const night = Array.from(new Set(splitArrayString(parameters.night))).filter(p => p !== '')
    return {
        'early': early,
        'night': night,
        'people': Array.from(new Set(splitArrayString(parameters.people).concat(early).concat(night))).filter(p => p !== ''),
    }
}

function splitArrayString(a) {
    return a.split(',').map(e => e.trim())
}

function getNrDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function padToTwoDigits(digit) {
    return ("0" + digit).slice(-2);
}

function pickN(n, from) {
    var candidates = from.slice()
    if (from.length === 0) {
        return [...Array(n).keys()].map(_ => '?')
    }

    // Pad
    while (candidates.length < n) {
        candidates = candidates.concat(from.slice())
    }

    var fullRepetitions = Math.floor(n / from.length)
    var nrPeopleNeededToPad = n - fullRepetitions * from.length
    var indicesToPick = range(0, fullRepetitions * from.length) // Everyone at least equal times
                        .concat(
                            shuffle(range(fullRepetitions * from.length, (fullRepetitions + 1) * from.length))
                            .slice(0, nrPeopleNeededToPad)) // Pad with random people only once
    indicesToPick = shuffle(indicesToPick)

    return indicesToPick.map(position => candidates[position])
}

function range(lowIncluding, highExcluding) {
    var list = []
    for (var i = lowIncluding; i < highExcluding; i++) {
        list.push(i);
    }
    return list
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
function emptyDayPlan(dateString) {
    const date = new Date(Date.parse(dateString))
    const year = date.getFullYear().toString()
    const weekday = DAYS[date.getDay()]
    const isHoliday = HOLIDAYS[year].includes(dateString)
    const isWorkday = 0 < date.getDay() && date.getDay() < 6 && !isHoliday

    return {
        'date': dateString,
        'weekday': weekday,
        'isWorkday': isWorkday,
        'early': '',
        'night': ''
    }
}

function emptyMonthPlan(roughDate) {
    const date = new Date(Date.parse(roughDate))
    const year = date.getFullYear().toString()
    const month = padToTwoDigits(date.getMonth() + 1)
    return [...Array(getNrDaysInMonth(year, date.getMonth() + 1)).keys()]
                .map(day => day + 1)
                .map(day => padToTwoDigits(day))
                .map(day => emptyDayPlan(`${year}-${month}-${day}`))
}

function getNrWorkDaysInPlan(plan) {
    return plan.filter(day => day.isWorkday).length
}

function filledMonthPlan(roughDate, people) {
    const plan = emptyMonthPlan(roughDate)
    const nrCleaningTasks = 2 * getNrWorkDaysInPlan(plan)
    const cleaners = pickN(nrCleaningTasks, people.people)
    var cleaner = 0
    for (var d = 0; d < plan.length; d++) {
        var day = plan[d]
        if (day.isWorkday) {
            day.early = cleaners[cleaner++]
            day.night = cleaners[cleaner++]
        }
    }
    return plan;
}

function earlyNightMonthPlan(roughDate, people) {
    var plan = filledMonthPlan(roughDate, people)

    for (var d = 0; d < plan.length; d++) {
        var day = plan[d]
        if (day.isWorkday && people.early.includes(day.night)) {
            for (var o = 0; o < plan.length; o++) {
                var changeDay = plan[o]
                if (changeDay.isWorkday && !people.early.includes(changeDay.early)) {
                    var tmp = day.night
                    day.night = changeDay.early
                    changeDay.early = tmp
                }
            }
        }

        if (day.isWorkday && people.night.includes(day.early)) {
            for (var o = 0; o < plan.length; o++) {
                var changeDay = plan[o]
                if (changeDay.isWorkday && !people.night.includes(changeDay.night)) {
                    var tmp = day.early
                    day.early = changeDay.night
                    changeDay.night = tmp
                }
            }
        }
    }

    return plan
}

export {
    HOLIDAYS,
    normalizePeople,
    splitArrayString,
    getNrDaysInMonth,
    padToTwoDigits,
    pickN,
    range,
    emptyDayPlan,
    emptyMonthPlan,
    getNrWorkDaysInPlan,
    filledMonthPlan,
    earlyNightMonthPlan
};
