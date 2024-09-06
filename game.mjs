//#region Dont look behind the curtain
// Do not worry about the next two lines, they just need to be there. 
import * as readlinePromises from 'node:readline/promises';
const rl = readlinePromises.createInterface({ input: process.stdin, output: process.stdout });

async function askQuestion(question) {
    return await rl.question(question);
}

//#endregion

import { ANSI } from './ansi.mjs';
import { HANGMAN_UI } from './graphics.mjs';
import { WORD_LIST } from './wordlist.mjs';

/*
    1. Pick a word
    2. Draw one "line" per char in the picked word.
    3. Ask player to guess one char || the word (knowledge: || is logical or)
    4. Check the guess.
    5. If guess was incorrect; continue drawing 
    6. Update char display (used chars and correct)
    7. Is the game over (drawing complete or word guessed)
    8. if not game over start at 3.
    9. Game over
*/

const VISIBLE_TO_PLAYER_WORDS = {
    ASK_QUESTION: "Guess a letter in the hidden word, or the word itself: ",
    WINNING_NOTICE: "Congratulations! You managed to save a life today!",
    LOSING_NOTICE:  "Im sorry, no life saved today :(",
    REPLAY_TEXT: "Do you want to play again? ",
    CORRECT_GUESS_STAT: "This was the total amount of correct guessed letters for this play session: ",
    WRONG_GUESS_STAT: "This was the total amount of wrong guessed letters for this play session: "
}
let correctWord = "";
let numberOfCharInWord = 0;
let guessedWord = "".padStart(correctWord.length, "_"); // "" is an empty string that we then fill with _ based on the number of char in the correct word.
let wordDisplay = "";
let isGameOver = false;
let wasGuessCorrect = false;
let wrongGuesses = [];

let rightGuess = 0;
let wrongGuess = 0;
//wordDisplay += ANSI.COLOR.GREEN;

await beginGame();

function consoleLogAutomation(){
    console.log(ANSI.CLEAR_SCREEN);
    console.log(drawWordDisplay());
    console.log(drawList(wrongGuesses, ANSI.COLOR.RED));
    console.log(HANGMAN_UI[wrongGuesses.length]);
}

function drawWordDisplay() {

    wordDisplay = "";

    for (let i = 0; i < numberOfCharInWord; i++) {
        
        if (guessedWord[i] != "_") {
            wordDisplay += ANSI.COLOR.GREEN;
        }
        wordDisplay += guessedWord[i] + " ";
        wordDisplay += ANSI.RESET;
        
    }

    return wordDisplay;
}

async function beginGame() {

    let playMoreAnswer = "";
    do{
        correctWord = WORD_LIST[Math.floor(Math.random() *WORD_LIST.length)].toLowerCase();
        numberOfCharInWord = correctWord.length;
        guessedWord = "".padStart(correctWord.length, "_");
        wordDisplay = "";
        isGameOver = false;
        wasGuessCorrect = false;
        wrongGuesses = [];
        await game();
        playMoreAnswer = (await askQuestion(VISIBLE_TO_PLAYER_WORDS.REPLAY_TEXT)).toLowerCase();
    }while(playMoreAnswer == "yes")
}

function drawList(list, color) {
    let output = "";

    for (let i = 0; i < list.length; i++) {
        if (!output.includes(list[i])){
            output += list[i] + " ";    
        }
        
    }

    return color + output + ANSI.RESET;
}

// Continue playing until the game is over. 
async function game() {
    while(!isGameOver){

        consoleLogAutomation();

        const answer = (await askQuestion(VISIBLE_TO_PLAYER_WORDS.ASK_QUESTION)).toLowerCase();

         if (answer == correctWord) {
             isGameOver = true;
             wasGuessCorrect = true;
        } else if (ifPlayerGuessedLetter(answer)) {

             let org = guessedWord;
            guessedWord = "";

            let isCorrect = false;
            for (let i = 0; i < correctWord.length; i++) {
                 if (correctWord[i] == answer) {
                    rightGuess++;
                     guessedWord += answer;
                    isCorrect = true;
                 } else {
                    // If the currents answer is not what is in the space, we should keep the char that is already in that space. 
                     guessedWord += org[i];
                 }
            }

            if (isCorrect == false) {
                 wrongGuesses.push(answer);
                 wrongGuess++;
            } else if (guessedWord == correctWord) {
                 isGameOver = true;
                wasGuessCorrect = true;
            }
        }   

        if (wrongGuesses.length == HANGMAN_UI.lenth){
            isGameOver = true;
        }
    }
}

while (!isGameOver) {
    
    console.log(ANSI.CLEAR_SCREEN);
    console.log(drawWordDisplay());
    console.log(drawList(wrongGuesses, ANSI.COLOR.RED));
    console.log(HANGMAN_UI[wrongGuesses.length]);

    

    // Read as "Has the player made to many wrong guesses". 
    // This works because we cant have more wrong guesses then we have drawings. 
    if (wrongGuesses.length == HANGMAN_UI.length) {
        isGameOver = true;
    }
    consoleLogAutomation();
}

// OUR GAME HAS ENDED.

console.log(ANSI.CLEAR_SCREEN);
console.log(drawWordDisplay());
console.log(drawList(wrongGuesses, ANSI.COLOR.RED));
console.log(VISIBLE_TO_PLAYER_WORDS.CORRECT_GUESS_STAT + " " + rightGuess);
console.log(VISIBLE_TO_PLAYER_WORDS.WRONG_GUESS_STAT + " " + wrongGuess);
//console.log(HANGMAN_UI[wrongGuesses.length]);

if (wasGuessCorrect) {
    console.log(ANSI.COLOR.YELLOW + VISIBLE_TO_PLAYER_WORDS.WINNING_NOTICE);
}else{
  console.log(VISIBLE_TO_PLAYER_WORDS.LOSING_NOTICE);
  
}
process.exit(0);


function ifPlayerGuessedLetter(answer) {
    return answer.length == 1
}
