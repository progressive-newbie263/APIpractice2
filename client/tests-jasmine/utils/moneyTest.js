import formatCurrency from "../../scripts/utils/money.js";

//can use describe inside describe to easily organize cde
describe('test suite: formatCurrency', () => {
  it('converts cents into dollars', () => {
    //format it to look like formal English
    expect(formatCurrency(2095)).toEqual('20.95');
  });

  it('works with 0', () => {
    //format it to look like formal English
    expect(formatCurrency(0)).toEqual('0.00');
  });

  it('rounds up to the nearest cent', () => {
    //format it to look like formal English
    expect(formatCurrency(2000.5)).toEqual('20.01');
  });
});

