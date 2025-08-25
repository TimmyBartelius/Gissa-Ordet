import React, { useState, useEffect, useRef } from "react";
import { words } from "./words";
import { words2 } from "./words2";
import { words3 } from "./words3";
import "./App.css";

function App() {
  const [currentWord, setCurrentWord] = useState("");
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [duration, setDuration] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [shouldBlink, setShouldBlink] = useState(false);

  const [teams, setTeams] = useState([
    { name: "Lag 1", score: 0 },
    { name: "Lag 2", score: 0 },
  ]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);

  const usedWordsRef = useRef(new Set());
  const lastWordRef = useRef("");

  // Tangentbordslyssnare (mellanslag = korrekt gissning)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && gameStarted) {
        e.preventDefault();
        handleCorrectGuess();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted]);

  const getRandomWord = () => {
    const allWords = [...words, ...words2, ...words3];
    if (usedWordsRef.current.size === allWords.length) {
      usedWordsRef.current.clear();
    }

    let newWord;
    let tries = 0;
    do {
      const randomIndex = Math.floor(Math.random() * allWords.length);
      newWord = allWords[randomIndex];
      tries++;
      if (tries > 100) break;
    } while (usedWordsRef.current.has(newWord));

    usedWordsRef.current.add(newWord);
    lastWordRef.current = newWord;
    return newWord;
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(duration);
    setCurrentWord(getRandomWord());
    setGameStarted(true);
    setGameOver(false);
    usedWordsRef.current.clear();
  };

  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          if (round < totalRounds) {
            // Byt lag och starta nästa omgång
            setCurrentTeamIndex((currentTeamIndex + 1) % teams.length);
            setRound((prev) => prev + 1);
            setTimeLeft(duration);
            setCurrentWord(getRandomWord());
            setGameStarted(true);
          } else {
            // Alla omgångar är spelade → visa slutresultat
            setGameStarted(false);
            setGameOver(true);
            setShouldBlink(true);

            setTimeout(() => {
              setShouldBlink(false);
            }, 1500);
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    gameStarted,
    timeLeft,
    round,
    totalRounds,
    teams.length,
    currentTeamIndex,
    duration,
  ]);

  const handleCorrectGuess = () => {
    setTeams((prevTeams) => {
      const newTeams = [...prevTeams];
      newTeams[currentTeamIndex].score += 1;
      return newTeams;
    });
    setCurrentWord(getRandomWord());
  };

  const handlePass = () => {
    setCurrentWord(getRandomWord());
  };

  const backToStart = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setCurrentWord("");
    setTimeLeft(0);
    setDuration(60);
  };

  const handleDurationChange = (e) => {
    setDuration(Number(e.target.value));
  };

  return (
    <div>
      <h1 className="title">Gissa Ordet</h1>

      {!gameStarted && !gameOver && (
        <div className="time">
          <label>Speltid: </label>
          <select
            className="time"
            onChange={handleDurationChange}
            value={duration}
          >
            <option value={10}>10 Sekunder</option>
            <option value={30}>30 Sekunder</option>
            <option value={60}>60 Sekunder</option>
          </select>
          <button className="startBtn" onClick={startGame}>
            Starta spelet!
          </button>
        </div>
      )}

      {gameStarted && (
        <div className="during-game">
          <h2 className="word-display">{currentWord}</h2>
          <p className="time-left">Tid kvar: {timeLeft} sek!</p>
          <p className="current-score">Poäng: {score}</p>
          <button className="correct-guess" onClick={handleCorrectGuess}>
            Nästa ord
          </button>
          <button className="pass" onClick={handlePass}>
            Pass
          </button>
        </div>
      )}

      {gameOver && (
        <div className={shouldBlink ? "blink-screen" : ""}>
          <h2 className="time-end">Spelet är slut!</h2>
          {teams.map((team) => (
            <h3 key={team.name}>
              {team.name}: {team.score} poäng
            </h3>
          ))}
          <button className="back-toBtn" onClick={backToStart}>
            Gå tillbaka till start
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
