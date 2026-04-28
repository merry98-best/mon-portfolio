const openMenu = () => {
	const menu = document.querySelector(".header-menu");
	menu.classList.toggle("active");
	if (menu.classList.contains("active")){
		document.querySelector("header .material-icons").innerHTML = "close"
	}
    else{
	    document.querySelector("header .material-icons").innerHTML = "menu"
	}
}


let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 31;
let isAnswered = false;
let isQuizFinished = false;

const questions = [
  { question: "1: La maladie de Wilson est causée par une surcharge en fer dans l’organisme.", correct: false },
  { question: "2: Le test de Coombs est utilisé pour diagnostiquer l’anémie hémolytique auto-immune.", correct: true },
  { question: "3: L’ecchymose est toujours un signe de thrombopénie.", correct: false },
  { question: "4: Le syndrome néphrotique se caractérise entre autres par une protéinurie supérieure à 3 g/jour.", correct: true },
  { question: "5: Un patient atteint de myasthénie grave voit ses symptômes s’améliorer après l’effort.", correct: false },
  { question: "6: La triade de Charcot (douleur, fièvre, ictère) est typique de l’angiocholite aiguë.", correct: true },
  { question: "7: Un souffle cardiaque systolique est toujours pathologique.", correct: false },
  { question: "8: La maladie coeliaque est une réaction auto-immune au lactose.", correct: false },
  { question: "9: L'hypercalcémie peut entraîner une polyurie.", correct: true },
  { question: "10: L’hépatite B chronique peut évoluer vers un carcinome hépatocellulaire.", correct: true },
  { question: "11: Le syndrome de Cushing est causé uniquement par une tumeur surrénalienne.", correct: false },
  { question: "12: Un souffle diastolique est toujours pathologique.", correct: true },
  { question: "13: Le déficit en G6PD peut provoquer une anémie hémolytique après la prise de certains médicaments.", correct: true },
  { question: "14: La sclérose latérale amyotrophique affecte uniquement les motoneurones périphériques.", correct: false },
  { question: "15: La maladie de Crohn ne peut pas affecter la bouche.", correct: false },
  { question: "16: La polykystose rénale est une maladie génétique à transmission autosomique dominante.", correct: true },
  { question: "17: Une hypokaliémie sévère peut provoquer des troubles du rythme cardiaque.", correct: true },
  { question: "18: L’aspirine est contre-indiquée chez l’enfant en cas de fièvre virale.", correct: true },
  { question: "19: Un patient diabétique peut ne pas ressentir de douleur lors d’un infarctus du myocarde.", correct: true },
  { question: "20: Le syndrome de Guillain-Barré commence souvent par une faiblesse des membres supérieurs.", correct: false },
  { question: "21: Une hémorragie sous-arachnoïdienne est toujours due à un traumatisme crânien.", correct: false },
  { question: "22: La metformine est contre-indiquée en cas d’insuffisance rénale sévère.", correct: true },
  { question: "23: L'angor de Prinzmetal est provoqué par une sténose coronaire fixe.", correct: false },
  { question: "24: L’érythropoïétine est produite principalement par le foie.", correct: false },
  { question: "25: La phénylcétonurie est dépistée systématiquement à la naissance.", correct: true },
  { question: "26: L’aplasie médullaire se traduit par une hyperplasie de la moelle osseuse.", correct: false },
  { question: "27: Le test de Romberg positif indique un trouble du cervelet.", correct: false },
  { question: "28: Un score de Glasgow de 15 correspond à un coma profond.", correct: false },
  { question: "29: L’endocardite infectieuse peut provoquer des lésions rénales.", correct: true },
  { question: "30: L’hyponatrémie sévère peut entraîner des convulsions.", correct: true }
];


// 🔐 Authentification
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  if (users[username] && users[username] === password) {
    localStorage.setItem("currentUser", username);
    showQuiz();
  } else {
    document.getElementById("auth-feedback").textContent = "Nom d'utilisateur ou mot de passe incorrect.";
  }
}

function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  if (password !== confirmPassword) {
    document.getElementById("auth-feedback").textContent = "Les mots de passe ne correspondent pas.";
    return;
  }

  if (users[username]) {
    document.getElementById("auth-feedback").textContent = "Ce nom d'utilisateur existe déjà.";
    return;
  }

  users[username] = password;
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", username);
  showQuiz();
}

function logout() {
  localStorage.removeItem("currentUser");
  location.reload();
}

function showRegisterForm() {
  document.getElementById("confirm-password").classList.remove("hidden");
  document.getElementById("register-btn").classList.remove("hidden");
  document.getElementById("back-to-login-btn").classList.remove("hidden");
  document.getElementById("login-btn").classList.add("hidden");
  document.getElementById("show-register-btn").classList.add("hidden");
}

function showLoginForm() {
  document.getElementById("confirm-password").classList.add("hidden");
  document.getElementById("register-btn").classList.add("hidden");
  document.getElementById("back-to-login-btn").classList.add("hidden");
  document.getElementById("login-btn").classList.remove("hidden");
  document.getElementById("show-register-btn").classList.remove("hidden");
}

// 🧠 Affichage du quiz
function showQuiz() {
  document.getElementById("auth-container").classList.add("hidden");
  document.getElementById("quiz-container").classList.remove("hidden");
  document.getElementById("welcome-user").textContent = `Bienvenue, ${localStorage.getItem("currentUser")} !`;
  score = 0;
  currentQuestion = 0;
  isQuizFinished = false;
  loadQuestion();
}

function loadQuestion() {
  if (currentQuestion >= questions.length) {
    endQuiz();
    return;
  }

  isAnswered = false;
  document.getElementById("feedback").textContent = "";
  document.getElementById("next-btn").classList.add("hidden");
  document.getElementById("restart-btn").classList.add("hidden");

  const questionObj = questions[currentQuestion];
  document.getElementById("question").textContent = questionObj.question;

  updateScoreDisplay();

  document.getElementById("true-btn").disabled = false;
  document.getElementById("false-btn").disabled = false;

  document.getElementById("timer-row").classList.remove("hidden");
  resetTimer();
  startTimer();
}

function checkAnswer(userAnswer) {
  if (isAnswered || isQuizFinished) return;
  isAnswered = true;

  const correct = questions[currentQuestion].correct;
  const feedback = document.getElementById("feedback");

  if (userAnswer === correct) {
    feedback.textContent = "Bonne réponse ! 🎉";
    feedback.style.color = "green";
    score++;
  } else {
    feedback.textContent = "Mauvaise réponse ❌";
    feedback.style.color = "red";
  }

  updateScoreDisplay();

  // Désactiver les boutons
  document.getElementById("true-btn").disabled = true;
  document.getElementById("false-btn").disabled = true;

  // Afficher bouton suivant
  document.getElementById("next-btn").classList.remove("hidden");
}

function nextQuestion() {
  currentQuestion++;
  loadQuestion();
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  isQuizFinished = false;
  loadQuestion();
}

function endQuiz() {
  isQuizFinished = true;
  stopTimer();
  document.getElementById("question").textContent = "Quiz terminé ! 🎉";
  document.getElementById("feedback").textContent = score === questions.length ? "Bravo ! Toutes les réponses sont correctes ! 🏆" : "";
  document.getElementById("next-btn").classList.add("hidden");
  document.getElementById("restart-btn").classList.remove("hidden");
  document.getElementById("timer-row").classList.add("hidden");
  updateScoreDisplay();
}

// ⏱️ Timer
function startTimer() {
  timeLeft = 30;
  document.getElementById("time-left").textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("time-left").textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);

      // Afficher feedback si utilisateur n'a pas répondu
      if (!isAnswered && !isQuizFinished) {
        isAnswered = true;
        document.getElementById("feedback").textContent = "Temps écoulé ⏱️";
        document.getElementById("feedback").style.color = "orange";
      }

      // Désactiver les boutons de réponse
      document.getElementById("true-btn").disabled = true;
      document.getElementById("false-btn").disabled = true;

      // Cacher le bouton "Question suivante" s’il est déjà affiché, on le réaffiche proprement
      document.getElementById("next-btn").classList.add("hidden");

      // Passer automatiquement à la question suivante
      setTimeout(() => {
        currentQuestion++;
        loadQuestion();
      }, 1000);
    }
  }, 1000);
}


function stopTimer() {
  clearInterval(timer);
}

function resetTimer() {
  stopTimer();
  timeLeft = 30;
  document.getElementById("time-left").textContent = timeLeft;
}

function updateScoreDisplay() {
  document.getElementById("score").textContent = `Score : ${score}`;
  document.getElementById("correct-answers").textContent = `${score}/${questions.length}`;
}



(function () {
  emailjs.init("sNIbKYHhuZiKlYLkU"); //  clé publique
})();

function toggleForm() {
  const formContainer = document.getElementById("contact-form-container");
  if (formContainer.style.display === "block") {
    formContainer.style.display = "none";
  } else {
    formContainer.style.display = "block";
    formContainer.scrollIntoView({ behavior: 'smooth' });
  }
}

document.getElementById("contact-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const status = document.getElementById("form-status");
  status.textContent = "Envoi du message...";
  status.style.color = "#ccc";

  emailjs.sendForm("service_njfzec4", "template_ulyf8vd", this)
    .then(() => {
      status.textContent = "Message envoyé avec succès !";
      status.style.color = "#70ff70";
      this.reset();
    }, (error) => {
      status.textContent = "Erreur lors de l'envoi. Réessayez.";
      status.style.color = "#ff7070";
    });
});



