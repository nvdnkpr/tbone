(function(){

  tbone.createModel('count').singleton();
  var count = 0;

  function increment() {
    tbone.set('count.er', ++count);
  }

  tbone.createModel('counter', function() {
    return {
      count: tbone.lookup('count.er')
    };
  }).singleton();

  tbone.createModel('subcounter', function () {
    return {
      sub: {
        sub: {
          sub: {
            sub: {
              sub: {
                sub: {
                  count: 42
                }
              }
            }
          }
        }
      }
    };
  }).singleton();

  JSLitmus.test('tbone.lookup model', function(count) {
    while (count--) tbone.lookup('count');
  });

  JSLitmus.test('tbone.lookup prop', function(count) {
    while (count--) tbone.lookup('count.count');
  });

  JSLitmus.test('T(prop)', function(count) {
    while (count--) tbone('count.count');
  });

  tbone.createModel('unbound').singleton();

  JSLitmus.test('T(prop, value) unbound', function(count) {
    while (count--) tbone('unbound.count', count);
  });

  tbone.createModel('bound').singleton();
  _.each(_.range(20), function() {
    T(function() {
      T('bound.count');
    });
  });

  JSLitmus.test('T(prop, value) with 20 listeners', function(count) {
    while (count--) tbone('bound.count', count);
  });

  JSLitmus.test('T(prop, value) with 20 listeners (with drain)', function(count) {
    while (count--) {
      tbone('bound.count', count);
      T.drain();
    }
  });

  JSLitmus.test('tbone.lookup subprop', function(count) {
    while (count--) tbone.lookup('subcounter.sub.sub.sub.sub.sub.sub.count');
  });

  JSLitmus.test('tbone.lookupText prop', function(count) {
    while (count--) tbone.lookupText('count.count');
  });

  JSLitmus.test('Bound model update', function(count) {
    while (count--) {
      increment();
      tbone.drain();
    }
  });

  var things3 = thingsType.make('things3');
  var $el = tmpl('numbers2', 'things3');

  JSLitmus.test('Collection update & render', function(count) {
    while (count--) {
      things3.reset([{ number: 2 }, { number: 3 }]);
      tbone.drain();
    }
  });
  JSLitmus.test('parse & render simple template', function(count) {
    while (count--) {
      tbone.addTemplate('test1', templates.test1);
      tmpl('test1');
    }
  });

  JSLitmus.test('render simple template', function(count) {
    while (count--) tmpl('test1');
  });

  JSLitmus.test('parse & render collection template', function(count) {
    while (count--) {
      tbone.addTemplate('numbers', templates.numbers);
      tmpl('numbers');
    }
  });

  JSLitmus.test('render collection template', function(count) {
    while (count--) tmpl('numbers');
  });

  JSLitmus.test('noop drain', function(count) {
    while (count--) drain();
  });

  JSLitmus.test('noop autorun', function(count) {
    while (count--) autorun(function () {});
  });

})();

var timers = {};
function acctimer(name) {
  if (!timers[name]) {
    timers[name] = (function(){
      var time = 0;
      var calls = 0;
      var start;
      var updated;
      setInterval(function() {
        if (updated) {
          console.log('profiler ' + name + ': ' + time + ' ms, ' + calls + ' calls');
          time = 0;
          calls = 0;
          updated = false;
        }
      }, 5000);
      return {
        start: function() {
          start = (new Date()).getTime();
          updated = true;
        },
        stop: function() {
          time += ((new Date()).getTime() - start);
          calls++;
          updated = true;
        }
      };
    }());
  }
  timers[name].start();
  return timers[name];
};
