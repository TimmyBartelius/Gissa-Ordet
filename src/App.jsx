import React, { useState, useEffect, useRef } from 'react';
import { words } from './words';
import { words2 } from './words2';
import { words3 } from './words3';
import './App.css';

function App() {
	const [currentWord, setCurrentWord] = useState('');
	const [score, setScore] = useState(0);
	const [gameStarted, setGameStarted] = useState(false);
	const [timeLeft, setTimeLeft] = useState(0);
	const [duration, setDuration] = useState(60);
	const [gameOver, setGameOver] = useState(false);
	const [shouldBlink, setShouldBlink] = useState(false);

	const audioRef = useRef(null);
	const lastWordRef = useRef(''); // Här sparar vi senaste ordet

	// Initiera ljudobjektet EN gång
	useEffect(() => {
		audioRef.current = new Audio('/Alarm.mp3');
	}, []);

	const getRandomWord = () => {
		const allWords = [...words, ...words2, ...words3];
		let newWord;
		do {
			const randomIndex = Math.floor(Math.random() * allWords.length);
			newWord = allWords[randomIndex];
		} while (newWord === lastWordRef.current);  // Undvik samma ord två gånger i rad
		lastWordRef.current = newWord;
		return newWord;
	};

	const startGame = () => {
		setScore(0);
		setTimeLeft(duration);
		setCurrentWord(getRandomWord());
		setGameStarted(true);
		setGameOver(false);

		// "Ljudupplåsning" – spela ljudet tyst och stoppa
		if (audioRef.current) {
			audioRef.current.volume = 0;
			audioRef.current.play().then(() => {
				audioRef.current.pause();
				audioRef.current.currentTime = 0;
				audioRef.current.volume = 1;
			}).catch(err => console.error('Ljudupplåsning misslyckades:', err));
		}
	};

	useEffect(() => {
		if (!gameStarted || timeLeft <= 0) return;

		const interval = setInterval(() => {
			setTimeLeft(prev => {
				if (prev <= 1) {
					clearInterval(interval);
					setGameStarted(false);
					setGameOver(true);
					setShouldBlink(true);

					// 🔊 Spela upp ljudet
					if (audioRef.current) {
						console.log('🔔 Spelar ljud...');
						audioRef.current.play().catch(err => console.error('Ljudfel:', err));
					}
					setTimeout(() => {
						setShouldBlink(false);
					}, 1500);

					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [gameStarted, timeLeft]);

	const handleCorrectGuess = () => {
		setScore(prev => prev + 1);
		setCurrentWord(getRandomWord());
	};

	const handlePass = () => {
		setCurrentWord(getRandomWord());
	};

	const backToStart = () => {
		setGameStarted(false);
		setGameOver(false);
		setScore(0);
		setCurrentWord('');
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
					<select className="time" onChange={handleDurationChange} value={duration}>
						<option value={10}>10 Sekunder</option>
						<option value={30}>30 Sekunder</option>
						<option value={60}>60 Sekunder</option>
					</select>
					<button className="startBtn" onClick={startGame}>Starta spelet!</button>
				</div>
			)}

			{gameStarted && (
				<div className="during-game">
					<h2 className="word-display">{currentWord}</h2>
					<p className="time-left">Tid kvar: {timeLeft} sek!</p>
					<p className="current-score">Poäng: {score}</p>
					<button className="correct-guess" onClick={handleCorrectGuess}>Nästa ord</button>
					<button className="pass" onClick={handlePass}>Pass</button>
				</div>
			)}

			{gameOver && (
				<div className={shouldBlink ? 'blink-screen' : ''}>
					<h2 className="time-end">Tiden är ute!</h2>
					<h3 className="total-score">Total Poäng: {score}</h3>
					<button className="next-game" onClick={startGame}>Spela igen</button>
					<button className="back-toBtn" onClick={backToStart}>Gå tillbaka till start</button>
				</div>
			)}
		</div>
	);
}

export default App;