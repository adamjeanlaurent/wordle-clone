import { IWordleImpl, IWordleColorClue, IWordleGuessResult, IWordleLetterDiff } from "./IWordleImpl";

import readline, { Interface } from 'readline';
import colors, { Color } from 'colors';

const readLineInterface: Interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

class TerminalWordle {
    private _wordleImpl: IWordleImpl = new IWordleImpl();
    private guessStack: string[] = [];

    private bgGray(str: string): string {
        return "\033[37;100m" +  str + "\033[0m";
    }

    public async GameLoop(): Promise<void> {
        let isGameOver = false;
        this._wordleImpl.Reset();
        //console.log(`the correct word is ${this._wordleImpl['currentCorrectAnswer']}`); // disgusting hack to access a member

        while(!isGameOver) {
            for await (let guess of readLineInterface) {
                guess = guess.toLowerCase();
                const guessResult: IWordleGuessResult = this._wordleImpl.DiffGuess(guess);

                // out of guesses lost
                if(guessResult.gameOverLost) {
                    isGameOver = true;
                    console.log('game is over you lost!');
                    console.log(`The Correct Answer Is: ${colors.bgMagenta(guessResult.correctAnswer)}`);
                    break;
                }

                // won
                if(guessResult.gameOverWin) {
                    isGameOver = true;
                    console.log('you win!');
                    break;
                }

                // invalid guess
                if(guessResult.illegalGuess) {
                   // console.log('That guess is illegal. Try again 🙂.');
                   this.PrintDiff();
                }
                else {
                    this.PrintDiff(guessResult.letterDiffs);
                }
            }
        }
    }
    
    private PrintDiff(guessDiffs: IWordleLetterDiff[] = []): void {
        let diffString: string = '';
        for(let diff of guessDiffs) {
            if(diff.colorClue === IWordleColorClue.Correct) {
                diffString += colors.green(diff.letter);
            }
            else if(diff.colorClue === IWordleColorClue.Elsewhere) {
                diffString += colors.yellow(diff.letter);
            }
            else {
               diffString += colors.gray(diff.letter);
            }
        }

        if(diffString.length > 0)
            this.guessStack.push(diffString);

        console.clear();

        for(let guess of this.guessStack) {
            console.log(guess);
        }
    }
};

const terminalWordle: TerminalWordle = new TerminalWordle();
terminalWordle.GameLoop();