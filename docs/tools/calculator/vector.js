/**
 * @file: description
 * @author: yongzhen
 * @Date: 2020-10-23 12:32:05
 * @LastEditors: yongzhen
 * @LastEditTime: 2020-10-29 20:09:35
 */
const arr = [
  ["A", "B", "C", "D"],
  ["P", "O", "N", "E"],
  ["K", "L", "M", "F"],
  ["G", "I", "H", "G"],
];

const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const vector = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

function build(row, col) {
  col = col || row;

  const arr = Array(row)
    .fill()
    .map(() => Array(col).fill(null));

  let deltaVector = vector[0];
  let count = 0;
  let robotPoint = [0, 0];

  while (isArrivable(robotPoint)) {
    const [i, j] = robotPoint;
    arr[i][j] = str[count++];

    let nextRobot = getNextRobotPoint();

    if (!isArrivable(nextRobot)) {
      deltaVector = getNextVector();
      nextRobot = getNextRobotPoint();
    }

    robotPoint = nextRobot;
  }

  return arr;

  function getNextRobotPoint() {
    const [i, j] = robotPoint;
    const [deltaI, deltaJ] = deltaVector;
    return [i + deltaI, j + deltaJ];
  }
  function getNextVector() {
    const nextIndex = vector.indexOf(deltaVector) + 1;
    return vector[nextIndex < vector.length ? nextIndex : 0];
  }
  function isArrivable(robotPoint) {
    const [i, j] = robotPoint;
    return arr[i] && arr[i][j] === null;
  }
}

console.log(build(5, 4));
console.log(build(4));
console.log(build(3));
