(function(so) {
  'use strict';

  var uidList = [], uid;

  // Create and push the uid identity method.
  uidList.push(uid = function() {
    return this;
  });

  // Push a new uid method onto the stack. Call this and
  // supply a unique key generator for sets of objects.
  so.pushUid = function(method) {
    uidList.push(method);
    uid = method;
    return method;
  };

  // Pop the previously pushed uid method off the stack and
  // assign top of stack to uid. Return the previous method.
  so.popUid = function() {
    var prev;
    uidList.length > 1 && (prev = uidList.pop());
    uid = uidList[uidList.length - 1];
    return prev || null;
  };

  // Processes a histogram consructed from two arrays, 'a' and 'b'.
  // This function is used generically by the below set operation 
  // methods, a.k.a, 'evaluators', to return some subset of
  // a set union, based on frequencies in the histogram. 
  function process(a, b, evaluator) {
    // Create a histogram of 'a'.
    var hist = Object.create(null), out = [], ukey, k;
    a.forEach(function(value) {
      ukey = uid.call(value);
      if (!hist[ukey]) {
        hist[ukey] = { value: value, freq: 1 };
      }
    });
    // Merge 'b' into the histogram.
    b.forEach(function(value) {
      ukey = uid.call(value);
      if (hist[ukey]) {
        if (hist[ukey].freq === 1)
          hist[ukey].freq = 3;
      } else {
        hist[ukey] = { value: value, freq: 2 };
      }
    });
    // Call the given evaluator.
    if (evaluator) {
      for (k in hist) {
        if (evaluator(hist[k].freq)) out.push(hist[k].value);
      }
      return out;
    } else {
      return hist;
    }
  };

  // Join two sets together.
  // Set.union([1, 2, 2], [2, 3]) => [1, 2, 3]
  so.union = function(a, b) {
    return process(a, b, function(freq) {
      return true;
    });
  };

  // Return items common to both sets. 
  // Set.intersection([1, 1, 2], [2, 2, 3]) => [2]
  so.intersection = function(a, b) {
    return process(a, b, function(freq) {
      return freq === 3;
    });
  };

  // Symmetric difference. Items from either set that
  // are not in both sets.
  // Set.difference([1, 1, 2], [2, 3, 3]) => [1, 3]
  so.difference = function(a, b) {
    return process(a, b, function(freq) {
      return freq < 3;
    });
  };

  // Relative complement. Items from 'a' which are
  // not also in 'b'.
  // Set.complement([1, 2, 2], [2, 2, 3]) => [3]
  so.complement = function(a, b) {
    return process(a, b, function(freq) {
      return freq === 1;
    });
  };

  // Returns true if both sets are equivalent, false otherwise.
  // Set.equals([1, 1, 2], [1, 2, 2]) => true
  // Set.equals([1, 1, 2], [1, 2, 3]) => false
  so.equals = function(a, b) {
    var max = 0,
      min = Math.pow(2, 53),
      key,
      hist = process(a, b);
    for (var key in hist) {
      max = Math.max(max, hist[key].freq);
      min = Math.min(min, hist[key].freq);
    }
    return min === 3 && max === 3;
  };
})(window.setOps = window.setOps || Object.create(null));

if (LN === 'vi') {
  document.getElementsByClassName('title')[1].innerHTML = 'Tập hợp';
  let lb = document.getElementsByTagName('label');
  lb[1].innerHTML = 'Nhập tập hợp A';
  lb[2].innerHTML = 'Nhập tập hợp B';
}

$('#inputA, #inputB').on('input', function() {
  let a = inputA.value.split(' ').map(parseFloat);
  let b = inputB.value.split(' ').map(parseFloat);
  let S1 = setOps.union(a, b);
  let S2 = setOps.intersection(a, b);
  let S3 = setOps.complement(a, b);
  let S4 = setOps.difference(a, b)
  let result = `\\begin{array}{l}
          ${setOps.equals(a, b) ? 'A=B' : 'A\\ne B'} \\\\
          A\\cup B=${S1.length ? `\\{${S1}\\}` : '\\varnothing'} \\\\
          A\\cap B=${S2.length ? `\\{${S2}\\}` : '\\varnothing'} \\\\ 
          A\\backslash B=${S3.length ? `\\{${S3}\\}` : '\\varnothing'} \\\\
          A\\Delta B=${S4.length ? `\\{${S4}\\}` : '\\varnothing'}
        \\end{array}`;
  output.innerHTML = katex.renderToString(result.replace(/,/g, ';'), {
    displayMode: true
  });
})