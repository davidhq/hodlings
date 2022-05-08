// source: https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
//
// usage:
// array is sorted by band only
// singers.sort(compareKeys('band'));
//
// in descending order
// singers.sort(compareKeys('band', null, 'desc'));
//
// array is sorted by band, then by year in ascending order by default
// singers.sort(compareKeys('band', 'year'));
//
// array is sorted by band, then by year in descending order
// singers.sort(compareKeys('band', 'year', 'desc'));
function compareKeys(key, key2, order = 'asc') {
  function _comparison(a, b, key) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
    const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }

    return order === 'desc' ? comparison * -1 : comparison;
  }

  return function innerSort(a, b) {
    let comparison = _comparison(a, b, key);

    if (comparison == 0 && key2) {
      comparison = _comparison(a, b, key2);
    }

    return comparison;
  };
}

export default function sortCoins(coinList) {
  return coinList.sort(compareKeys('id', 'name')).sort((a, b) => {
    // push these to the bottom of list
    if (a?.id.endsWith('-wormhole')) {
      return 1;
    }

    if (b?.id.endsWith('-wormhole')) {
      return -1;
    }

    return 0;
  });
}
