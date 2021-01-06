import { calc } from "./Solution";

test("Others: Calculator", () => {
  expect(calc.parse("1+2+2*(3*4*(3+1)-(4/2))-5")).toEqual(90);
  expect(calc.parse("(1+2+2)*(3*4*(3+1)-(4/2))-5")).toEqual(225);
  expect(calc.parse("(1+2+2)*(-3*4*(3+1)-(4))-5")).toEqual(-265);
  expect(calc.parse("-1+2+2*(-3*4*(3+1)-(4))-5")).toEqual(-108);
});

// [2, '*', '.', 1]
// [2, '*', 2, '.', 1]
