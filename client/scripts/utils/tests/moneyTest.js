//Manuel testing (check if code works). Disad is hard to retest
import formatCurrency from "../money.js";

//NAMING TEST CASES SO THAT YOU KNOW WHAT IT IS MENTIONING
console.log('test suite: formatCurrency');
console.log('');

//test case 1 - BASIC TEST CASE (CODE WORKING OR NOT)
console.log('converts cents into dollars');
if(formatCurrency(2095) === '20.95'){
  console.log('passed');
}
else {
  console.log('failed');
}

//test case 2 - EDGE CASES (TRICKY CASES)
console.log('works with 0');
if(formatCurrency(0) === '0.00'){
  console.log('passed');
}
else {
  console.log('failed');
}

//test case 3 - EDGE CASES (TRICKY CASES)
console.log('rounds up to the nearest cent');
if(formatCurrency(2000.5) === '20.01'){
  console.log('passed');
}
else {
  console.log('failed');
}

//test case 4 - EDGE CASES (TRICKY CASES)
console.log('rounds up to the nearest cent 2');
if(formatCurrency(2000.4) === '20.00'){
  console.log('passed');
}
else {
  console.log('failed');
}