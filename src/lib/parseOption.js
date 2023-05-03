function isOption(string) {
  let ans = true;
  if (typeof string === 'string') {
    let i = 0;
    for (i = 0; i < 1; i += 1) {
      if (string.charAt(i) === '-') {
        break;
      }
    }
    if (i === 0) {
      ans = false;
    }
  } else {
    ans = false;
  }
  return ans;
}

function transformOption(value) {
  let ans;
  const s = value.split('-');
  if (s.length >= 1) {
    ans = s.map((e, i) => {
      if (i === 0) {
        return e;
      } else {
        return e.charAt(0).toUpperCase() + e.substring(1, e.length);
      }
    });
  } else {
    ans = value;
  }
  return ans.join('');
}

export default function parseOption(...params) {
  const ans = {};
  for (let i = 0; i < params.length; i += 1) {
    const param = params[i];
    if (param.charAt(0) === '-') {
      const regexp = /^\-([a-z])$/;
      if (regexp.test(param)) {
        const [_, k] = param.match(regexp);
        if (isOption(params[i+1])) {
          ans[k] = params[i+1];
          i += 1;
        } else {
          ans[k] = true;
        }
      }
      if (param.charAt(1) === '-') {
        const regexp = /^\-\-([a-z\-]+)$/;
        if (regexp.test(param)) {
          const [_, k] = param.match(regexp);
          if (isOption(params[i+1])) {
            ans[transformOption(k)] = params[i+1];
            i += 1;
          } else {
            ans[k] = true;
          }
        }
      }
    }
  }
  return ans;
}
