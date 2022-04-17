import { WORDS } from './wordList';
import { VALID_GUESSES } from './validGuesses';

export enum IWordleColorClue {
    Absent,
    Elsewhere,
    Correct,
}

export interface IWordleLetterDiff {
    letter: string;
    colorClue: IWordleColorClue;
}

export interface IWordleGuessResult {
    letterDiffs: IWordleLetterDiff[];
    gameOverLost: boolean;
    gameOverWin: boolean;
    correctAnswer: string;
    illegalGuess: boolean;
}

// base interface containing wordle game logic
// can be used to create a world terminal game or UI or w/e your heart desires
export class IWordleImpl {
   private wordBank: string[] = WORDS;
   private dictionary: string[] = VALID_GUESSES;
   private usedWords: Set<string> = new Set<string>(['']);
   private currentCorrectAnswer = '';
   private guessesLeft: number = 6;

   public Reset() {
        this.currentCorrectAnswer = this.GetRandomWord();
        this.guessesLeft = 6;
   }
   
   private GetRandomWord(): string {
        let randomWord: string = '';

        // keep getting a random word until we find one we haven't used
        while(this.usedWords.has(randomWord)) {
            randomWord = this.wordBank[Math.floor(Math.random() * this.wordBank.length)];
        }

        // if we haven't seen the last word, add it to the set of used words
        if(!this.usedWords.has(this.currentCorrectAnswer)) {
            this.usedWords.add(this.currentCorrectAnswer);
        } 

        this.currentCorrectAnswer = randomWord;
        return randomWord;
   }

   // inspired by: https://github.com/lynn/hello-wordl 🙂
    public DiffGuess(guess: string): IWordleGuessResult {
        let missedCorrectLetters: string[] = [];
        let correctLettersGuessed: number = 0;
        
        if(!this.dictionary.includes(guess)) {
            return { letterDiffs: [], gameOverLost: false, gameOverWin: false, correctAnswer: this.currentCorrectAnswer, illegalGuess: true };
        }

        // only increment this if is a valid guess
        this.guessesLeft--;

        // compare guess and correctAnswer
        // if there is a letter mismatch
        // then remember the mismatches (take the correct letter)
        this.currentCorrectAnswer.split("").forEach((correctAnswerLetter, i) => {
        if (guess[i] !== correctAnswerLetter) {
            missedCorrectLetters.push(correctAnswerLetter);
        }
        });

        // ================================================================================================
        // CASES:
        // ================================================================================================
        // 1: (guess[i] === correctAnswer[i]) 
        // - correct letter match, return green
        // ================================================================================================
        // 2: (letters do not match, AND guessLetter is in missedCorrectLetters)
        // - in the case, if the guessLetter is in missedCorrectLetters,
        // then that means that this letter from our guess is in the correct word later, but
        // we missed it, in so that means that this is yellow, since the letter appears somewhere 
        // else in the word and we missed that one, so it's guarnetted that we didn't guess it correctly
        // somewhere else (well we could have if there are duplicates, but better to say there is at least one instance 
        // that we missed later in the word, so this one must be yellow)
        // We need to remove the letter from missedCorrectLetters now, to properly handle duplicates
        // ================================================================================================
        // 3: (letters do not match, AND guessLetter is not in missedCorrectLetters)
        // - in the case, the letters do not match, and the guessLetter does not appear later in the
        // correct word (at least not in a place that we missed.) This means that it must be absent
        // ================================================================================================
        const letterDiffs: IWordleLetterDiff[] = guess.split("").map((guessLetter, i) => {
        let missedCorrectLeterIndex: number;
        if (this.currentCorrectAnswer[i] === guessLetter) {
            correctLettersGuessed++;
            return { colorClue: IWordleColorClue.Correct, letter: guessLetter };
        } 
        else if ((missedCorrectLeterIndex = missedCorrectLetters.indexOf(guessLetter)) > -1) {
            // "use it up" so we don't clue at it twice
            missedCorrectLetters[missedCorrectLeterIndex] = "";
            return { colorClue: IWordleColorClue.Elsewhere, letter: guessLetter };
        } 
        else {
            return { colorClue: IWordleColorClue.Absent, letter: guessLetter };
        }
        });

        
        // you lose if this was your last guess and it wasn't correct
        if(this.guessesLeft === 0 && (correctLettersGuessed !== 5)) {
            return { letterDiffs: [], gameOverLost: true, gameOverWin: false, correctAnswer: this.currentCorrectAnswer, illegalGuess: false };
        }
        
        return { letterDiffs: letterDiffs, gameOverLost: false, gameOverWin: (correctLettersGuessed === 5), correctAnswer: this.currentCorrectAnswer, illegalGuess: false };
    }

    constructor() { }
}