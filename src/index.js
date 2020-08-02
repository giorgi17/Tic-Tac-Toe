import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Square from './Square';
import Restart from './Restart';

const Game = () => {

  const [ squares, setSquares ] = useState(Array(9).fill(null));
  const [ isXNext, setIsXNext ] = useState(true);
  const [ optionsChecked, setOptionsChecked ] = useState(false);
  const [ rows, setRows ] = useState(3);
  const [ columns, setColumns ] = useState(3);
  const [ numToWin, setNumToWin ] = useState(3);
  const [ winPossibilities, setWinPossibilities ] = useState([]);
  const gameBoardRef = useRef(null);
  
  useEffect(() => {
    setWinPossibilities(calculatePossibilities(rows, columns));
    setSquares(Array(columns*rows).fill(null));
  }, [rows, columns]);

  const nextSymbol = isXNext ? "X" : "O";
  const winner = calculateWinner(squares, winPossibilities, numToWin, columns, gameBoardRef);

  const renderSquare = (i) => {
    var d = new Date();
    return <Square
      value={squares[i]}
      onClick={() => {
        if (squares[i] != null || winner != null) {
          return;
        }
        const nextSquares = squares.slice();
        nextSquares[i] = nextSymbol;
        setSquares(nextSquares);
        setIsXNext(!isXNext); // toggle turns
      }}
      key={i + d.getTime()}
    />;
  }

  const renderRestartButton = () => {
    return (
      <Restart
        onClick={() => {
          setSquares(Array(rows*columns).fill(null));
          setIsXNext(true);
        }}
      />
    );
  }

  const getStatus = () => {
    if (winner) {
      return "Winner: " + winner.winner;
    } else if (isBoardFull(squares)) {
      return "Draw!";
    } else {
      return "Next player: " + nextSymbol;
    }
  }

  const handleNums = (e, setterFunc) => {
    const num = parseInt(Math.round(e.target.value));

    if (num && num >= 2)
      setterFunc(e.target.value);
    else if (e.target.value === '')
      setterFunc(e.target.value); 
    // else if ()
    //   setterFunc(3)
  }

  const drawBoard = (rows, columns) => {
    if (rows === ''  || columns === '') {
      return null;
    }

    var d = new Date();
    let rowsCopy = parseInt(rows);
    let columnsCopy = parseInt(columns);

    var currentNum = 0;
    var boardRows = [];

    for (var i = 0; i < rowsCopy; i++) {
      const boardColumns = [];

      for (var k = 0; k < columnsCopy; k++) {
        boardColumns.push(renderSquare(currentNum));
        currentNum+=1;
      }

      boardRows.push(<div className="board-row" key={currentNum + d.getTime()}> {boardColumns} </div>);
    }

    return boardRows;
  }

  return (
    <div className="container">
      <div className="game">

        <div className="game-board" ref={gameBoardRef}>
          {drawBoard(rows, columns)}
        </div>

        <div className="options-panel">
          <h4 className="options-label">Options</h4>
          <label className="switch">
            <input name="options"
                  type="checkbox" 
                  checked={optionsChecked}
                  onChange={() => setOptionsChecked(!optionsChecked)}/>
            <span className="slider round"></span>
          </label>

          {optionsChecked ?
            <div className="options-inputs">
              <div className="options-input-container">
                <span className="options-input-label">Rows:</span>
                <input type="text" className="options-input"
                 value={rows} onChange={e => handleNums(e, setRows)}/>
              </div>
              
              <div className="options-input-container">
                <span className="options-input-label">Columns:</span>
                <input type="text" className="options-input"
                 value={columns} onChange={e => handleNums(e, setColumns)}/>
              </div>

              <div className="options-input-container">
                <span className="options-input-label">NumToWin:</span>
                <input type="text" className="options-input"
                 value={numToWin} onChange={e => handleNums(e, setNumToWin)}/>
              </div>
            </div>
           : null}
        </div>



        <div className="game-info">{getStatus()}</div>
        <div className="restart-button">{renderRestartButton()}</div>
      
      </div>
    </div>
  );
}

const paintWonLines = (winningLines, columns, gameBoardRef) => {
  for (let i = 0; i < winningLines.length; i++) {
    if (gameBoardRef.current) {
      const remainder = winningLines[i] % columns;
      const numberOfRow = (winningLines[i] - remainder) / columns;
      // console.log(remainder);
      // console.log(numberOfRow);

      try {
        gameBoardRef.current.children[numberOfRow].children[remainder].style.backgroundColor = "red";
      } catch (error) {
        
      }
    }
  }
}

const calculatePossibilities = (rows, columns) => {
  const possibilitiesArray = [];
  var leftSide = [];
  var rightSide = [];
  var topSide = [];
  var bottomSide = [];

  // Vertical possibilities
  var allVerticalPossibilities = [];
  for (var i = 0; i < columns; i++) {
    const verticalPossibilities = [i];
    for (var p = 0; p < rows - 1; p++) {
      verticalPossibilities.push(verticalPossibilities[verticalPossibilities.length - 1] + parseInt(columns));
    }
    possibilitiesArray.push(verticalPossibilities);
    allVerticalPossibilities.push(verticalPossibilities);  
  }
  leftSide = allVerticalPossibilities[0];
  rightSide = allVerticalPossibilities.pop();
  // console.log(leftSide);
  // console.log(rightSide);

  // Horizontal possibilities
  var rowStartingNum = 0;
  var allHorizontalPossibilities = [];
  for (var k = 0; k < rows; k++) {
    const horizontalPossibilities = [rowStartingNum];
    for (var l = 0; l < columns - 1; l++) {
      horizontalPossibilities.push(horizontalPossibilities[horizontalPossibilities.length - 1] + 1);
    }
    possibilitiesArray.push(horizontalPossibilities);
    allHorizontalPossibilities.push(horizontalPossibilities);
    rowStartingNum+=parseInt(columns);  
  }
  topSide = allHorizontalPossibilities[0];
  bottomSide = allHorizontalPossibilities.pop();
  // console.log(topSide);
  // console.log(bottomSide);
  // console.log(allHorizontalPossibilities);

  // Left diagonals possibilities
  var allLeftDiagonalPossibilities = [];
  if (topSide && rightSide) {
    const topSideCopy = [...topSide];
    const rightSideCopy = [...rightSide];
    const leftSideCopy = [...leftSide];
    const bottomSideCopy = [...bottomSide];
    rightSideCopy.shift();
    rightSideCopy.pop();
    topSideCopy.shift();
    leftSideCopy.shift();
    bottomSideCopy.shift();
    bottomSideCopy.pop();
    const leftDiagonalStartingPoints = [...topSideCopy, ...rightSideCopy];
    const leftDiagonalEndPoints = [...leftSideCopy, ...bottomSideCopy];
    // console.log(leftDiagonalStartingPoints);
    // console.log(leftDiagonalEndPoints); 

    for (var m = 0; m < leftDiagonalStartingPoints.length; m++) {
      var leftDiagonalStartingNum = leftDiagonalStartingPoints[m];
      const leftDiagonalPossibility = [];
      for (var n = 0; n < rows; n++) {
        leftDiagonalPossibility.push(leftDiagonalStartingNum);
        if (leftDiagonalEndPoints.includes(leftDiagonalStartingNum))
          break;
        else
          leftDiagonalStartingNum = parseInt(leftDiagonalStartingNum) + parseInt(columns-1);
      }
      allLeftDiagonalPossibilities.push(leftDiagonalPossibility);
      possibilitiesArray.push(leftDiagonalPossibility);
    }
    // console.log(allLeftDiagonalPossibilities);
  }
  
  // Right diagonals possibilities
  var allRightDiagonalPossibilities = [];
  if (topSide && leftSide) {
    const topSideCopy = [...topSide];
    const rightSideCopy = [...rightSide];
    const leftSideCopy = [...leftSide];
    const bottomSideCopy = [...bottomSide];
    rightSideCopy.shift();
    topSideCopy.pop();
    leftSideCopy.shift();
    leftSideCopy.pop();
    bottomSideCopy.shift();
    bottomSideCopy.pop();
    const rightDiagonalStartingPoints = [...topSideCopy, ...leftSideCopy];
    const rightDiagonalEndPoints = [...rightSideCopy, ...bottomSideCopy];
    // console.log(rightDiagonalStartingPoints);
    // console.log(rightDiagonalEndPoints); 

    for (var z = 0; z < rightDiagonalStartingPoints.length; z++) {
      var rightDiagonalStartingNum = rightDiagonalStartingPoints[z];
      const rightDiagonalPossibility = [];
      for (var x = 0; x < rows; x++) {
        rightDiagonalPossibility.push(rightDiagonalStartingNum);
        if (rightDiagonalEndPoints.includes(rightDiagonalStartingNum))
          break;
        else
          rightDiagonalStartingNum = rightDiagonalStartingNum + parseInt(columns)+1;
      }
      allRightDiagonalPossibilities.push(rightDiagonalPossibility);
      possibilitiesArray.push(rightDiagonalPossibility);
    }
    // console.log(allRightDiagonalPossibilities);
  }

  return possibilitiesArray;
}

const calculateWinner = (squares, possibleLines, numToWin, columns, gameBoardRef) => {
  let result = null;
  
  // go over all possibly winning lines and check if they consist of only X's/only O's
  for (let i = 0; i < possibleLines.length; i++) {
    var winnerLine = [];
    let possibleWinner = '';
    for (let k = 0; k < possibleLines[i].length; k++) {
      if (squares[possibleLines[i][k]] === 'X') {
        if (possibleWinner === 'O')
          winnerLine = [];
        winnerLine.push(possibleLines[i][k]);
        possibleWinner = 'X';
        if (winnerLine.length === parseInt(numToWin)) {
          result = {winner: 'X', numbers: winnerLine};
          break;
        }
      } else if (squares[possibleLines[i][k]] === 'O') {
        if (possibleWinner === 'X')
          winnerLine = [];
        winnerLine.push(possibleLines[i][k]);
        possibleWinner = 'O';
        if (winnerLine.length === parseInt(numToWin)) {
          result = {winner: 'O', numbers: winnerLine};
          break;
        }
      }
    }
  }

  if (result) {
    paintWonLines(result.numbers, columns, gameBoardRef);
  }

  return result;
}

const isBoardFull = (squares) => {
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] == null) {
      return false;
    }
  }
  return true;
}

ReactDOM.render(<Game />, document.getElementById("root"));