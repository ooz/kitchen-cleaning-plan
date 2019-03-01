import 'https://unpkg.com/chai@4.1.2/chai.js';

mocha.setup('bdd');

import {
  HOLIDAYS,
  normalizePeople,
  getNrDaysInMonth,
  padToTwoDigits,
  pickN,
  range,
  emptyDayPlan,
  emptyMonthPlan,
  getNrWorkDaysInPlan,
  filledMonthPlan,
  earlyNightMonthPlan
} from './kitchen-cleaning-plan.js';



describe('HOLIDAYS', function () {
  it('should start with 2018', function () {
    chai.expect(HOLIDAYS).to.not.have.property('2017')
    chai.expect(HOLIDAYS).to.have.property('2018')
  })

  it('should end with 2050', function () {
    chai.expect(HOLIDAYS).to.have.property('2050')
    chai.expect(HOLIDAYS).to.not.have.property('2051')
  })
});

describe('normalizePeople', function () {
  it('should contain all people in people field', function () {
    const people = normalizePeople({
      'early': 'foo, bar',
      'night': 'baz,beb',
      'people': 'bob'
    })

    chai.expect(people.early).to.include('foo', 'bar');
    chai.expect(people.early.length).to.equal(2)
    chai.expect(people.night).to.include('baz', 'beb');
    chai.expect(people.night.length).to.equal(2)
    chai.expect(people.people).to.include('foo', 'bar', 'baz', 'bob', 'beb');
    chai.expect(people.people.length).to.equal(5)
  })
});

describe('getNrDaysInMonth', function () {
  it('should get normal months correct', function () {
    chai.expect(getNrDaysInMonth(2018, 1)).to.equal(31)
    chai.expect(getNrDaysInMonth(2018, 4)).to.equal(30)
    chai.expect(getNrDaysInMonth(2018, 5)).to.equal(31)
    chai.expect(getNrDaysInMonth(2018, 6)).to.equal(30)
    chai.expect(getNrDaysInMonth(2018, 12)).to.equal(31)
  })

  it('should get february correct', function () {
    chai.expect(getNrDaysInMonth(2018, 2)).to.equal(28)
    chai.expect(getNrDaysInMonth(2019, 2)).to.equal(28)
    chai.expect(getNrDaysInMonth(2020, 2)).to.equal(29)
  })
});

describe('padToTwoDigits', function () {
  it('should pad single digit numbers', function () {
    chai.expect(padToTwoDigits(1)).to.equal("01")
    chai.expect(padToTwoDigits(4)).to.equal("04")
    chai.expect(padToTwoDigits(9)).to.equal("09")
  })

  it('should not pad double digit numbers', function () {
    chai.expect(padToTwoDigits(10)).to.equal("10")
    chai.expect(padToTwoDigits(20)).to.equal("20")
    chai.expect(padToTwoDigits(31)).to.equal("31")
  })
});

describe('range', function () {
  it('should be empty if no overlap', function () {
    var numbers = range(2, 2)
    chai.expect(numbers.length).to.equal(0)
  })
  it('should include low end, exclude high end', function () {
    var numbers = range(0, 10)
    chai.expect(numbers.length).to.equal(10)
    for (var i = 0; i < 10; i++) {
      chai.expect(numbers[i]).to.equal(i)
    }
  })
});

describe('pickN', function () {
  it('should repeat people if not enough available', function () {
    var picks = pickN(30, ['foo', 'bar'])
    chai.expect(picks.length).to.equal(30)
  })

  it('should pick everyone once if amount of people matches', function () {
    var picks = pickN(5, ['foo', 'bar', 'baz', 'bob', 'beb'])
    chai.expect(picks.length).to.equal(5)
    chai.expect(picks).to.include('foo', 'bar', 'baz', 'bob', 'beb')
  })

  it('should at least pick everyone before repeating', function () {
    for (var run = 0; run < 100; run++) { // Need to repeat this a couple of times, otherwise all people might be picked by RNG
      var picks = pickN(7, ['foo', 'bar', 'baz', 'bob', 'beb'])
      chai.expect(picks.length).to.equal(7)
      chai.expect(picks).to.include('foo', 'bar', 'baz', 'bob', 'beb')
    }
  })

  it('should pick ? if no people are provided', function () {
    var picks = pickN(5, [])
    chai.expect(picks.length).to.equal(5)
    chai.expect(picks).to.include('?')
  })
});

describe('emptyDayPlan', function () {
  it('should be workday on workdays', function () {
    var day = emptyDayPlan('2018-10-01')
    chai.expect(day.isWorkday).to.be.true
    chai.expect(day.weekday).to.equal('Mon')
  })

  it('should not be workday on holidays', function () {
    var day = emptyDayPlan('2018-10-03')
    chai.expect(day.isWorkday).to.be.false
    chai.expect(day.weekday).to.equal('Wed')
  })

  it('should not be workday on weekend', function () {
    var day = emptyDayPlan('2018-10-06')
    chai.expect(day.isWorkday).to.be.false
    chai.expect(day.weekday).to.equal('Sat')
  })
});

describe('emptyMonthPlan', function () {
  it('should get empty workday plan for October 2018', function () {
    var plan = emptyMonthPlan('2018-10-15')
    chai.expect(plan.length).to.equal(31)
    chai.expect(plan[0].isWorkday).to.be.true
    chai.expect(plan[0].weekday).to.equal('Mon')
    chai.expect(plan[2].isWorkday).to.be.false
    chai.expect(plan[27].isWorkday).to.be.false
    chai.expect(plan[29].isWorkday).to.be.true
    chai.expect(plan[30].isWorkday).to.be.false
    chai.expect(plan[30].date).to.equal('2018-10-31')
  })
});

describe('getNrWorkDaysInPlan', function () {
  it('should get number of workdays for October 2018', function () {
    const plan = emptyMonthPlan('2018-10-01')
    const nrWorkdays = getNrWorkDaysInPlan(plan)
    chai.expect(nrWorkdays).to.equal(21)
  })
});

describe('filledMonthPlan', function () {
  it('should make basic cleaning plan for October 2018', function () {
    const plan = filledMonthPlan('2018-10-01', { early: [], night: [], people: ['Bob', 'Foo'] })
    const nrWorkdays = getNrWorkDaysInPlan(plan)

    chai.expect(nrWorkdays).to.equal(21)
    for (var d = 0; d < plan.length; d++) {
      var day = plan[d]
      if (day.isWorkday) {
        chai.expect(day.early).to.be.oneOf(['Bob', 'Foo'])
        chai.expect(day.night).to.be.oneOf(['Bob', 'Foo'])
      } else {
        chai.expect(day.early).to.equal('')
        chai.expect(day.night).to.equal('')
      }
    }
  })

  it('should make a fair plan for October 2018', function () {
    const plan = filledMonthPlan('2018-10-01', { early: [], night: [], people: ['Bob', 'Foo'] })

    var allAssignments = plan.filter(day => day.isWorkday).map(day => [day.early, day.night]).flat()
    var nrBobAssignments = allAssignments.filter(a => a === 'Bob').length
    var nrFooAssignments = allAssignments.filter(a => a === 'Foo').length
    chai.expect(nrBobAssignments).to.equal(21)
    chai.expect(nrFooAssignments).to.equal(21)
  })
});

describe('earlyNightMonthPlan', function () {
  it('should consider early birds and night owls', function () {
    const plan = earlyNightMonthPlan('2018-10-01', { early: ['Bird'], night: ['Owl'], people: ['Bird', 'Owl'] })

    var earlyAssignments = plan.filter(day => day.isWorkday).map(day => day.early)
    var nightAssignments = plan.filter(day => day.isWorkday).map(day => day.night)
    var nrBirdAssignments = earlyAssignments.filter(a => a === 'Bird').length
    var nrOwlAssignments = nightAssignments.filter(a => a === 'Owl').length
    chai.expect(nrBirdAssignments).to.equal(21)
    chai.expect(nrOwlAssignments).to.equal(21)
  })
});



mocha.checkLeaks();
mocha.run();
