import React, { useState, useEffect, useRef } from "react";
import { words } from "./words";
import { words2 } from "./words2";
import { words3 } from "./words3";
import "./App.css";

function App() {
  const [currentWord, setCurrentWord] = useState("");
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
  const [isPaused, setIsPaused] = useState(false);

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
    setTimeLeft(duration);
    setCurrentWord(getRandomWord());
    setGameStarted(true);
    setGameOver(false);
    setIsPaused(false);
    usedWordsRef.current.clear();
  };

  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          if (round < totalRounds) {
            // Pausläge innan nästa lag får köra
            setGameStarted(false);
            setIsPaused(true);
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
  }, [gameStarted, timeLeft, round, totalRounds, duration]);

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
    setCurrentWord("");
    setTimeLeft(0);
    setDuration(60);
    setRound(1);
    setCurrentTeamIndex(0);
    setTeams([
      { name: "Lag 1", score: 0 },
      { name: "Lag 2", score: 0 },
    ]);
  };

  const handleDurationChange = (e) => {
    setDuration(Number(e.target.value));
  };

  const handleNextTeam = () => {
    setIsPaused(false);
    setCurrentTeamIndex((currentTeamIndex + 1) % teams.length);
    setRound((prev) => prev + 1);
    setTimeLeft(duration);
    setCurrentWord(getRandomWord());
    setGameStarted(true);
  };

  return (
    <div>
      <h1 className="title">Gissa Ordet</h1>

      {/* Startskärm */}
      {!gameStarted && !gameOver && !isPaused && (
        <div className="time">
          {teams.map((team, index) => (
            <div key={index}>
              <label>Lag {index + 1} namn: </label>
              <input
                type="text"
                value={team.name}
                onChange={(e) => {
                  const newTeams = [...teams];
                  newTeams[index].name = e.target.value;
                  setTeams(newTeams);
                }}
              />
            </div>
          ))}
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

      {/* Under spelet */}
      {gameStarted && (
        <div className="during-game">
          <h2>{teams[currentTeamIndex].name} spelar</h2>
          <h2 className="word-display">{currentWord}</h2>
          <p className="time-left">Tid kvar: {timeLeft} sek!</p>
          <p className="current-score">
            {teams[currentTeamIndex].name}: {teams[currentTeamIndex].score}{" "}
            poäng
          </p>
          <button className="correct-guess" onClick={handleCorrectGuess}>
            Nästa ord
          </button>
          <button className="pass" onClick={handlePass}>
            Pass
          </button>
        </div>
      )}

      {/* Paus mellan rundor */}
      {isPaused && !gameOver && (
        <div>
          <h2>Runda {round} klar!</h2>
          <p>
            {teams[currentTeamIndex].name} fick totalt{" "}
            {teams[currentTeamIndex].score} poäng.
          </p>
          <button onClick={handleNextTeam}>Nästa lag</button>
        </div>
      )}

      {/* Slutresultat */}
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
