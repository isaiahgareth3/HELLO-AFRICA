function showTime() {
	document.getElementById('currentTime').innerHTML = new Date().toUTCString();
}
showTime();
setInterval(function () {
	showTime();
}, 1000);// Firebase config (replace with your actual Firebase config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginPanel = document.getElementById("loginPanel");
const userPanel = document.getElementById("userPanel");
const lessonPanel = document.getElementById("lessonPanel");
const userEmailSpan = document.getElementById("userEmail");
const userPointsSpan = document.getElementById("userPoints");

document.getElementById("loginBtn").onclick = () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, pass)
    .catch((e) => alert(e.message));
};

document.getElementById("signupBtn").onclick = () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, pass)
    .then(userCredential => {
      // Initialize points document
      db.collection('users').doc(userCredential.user.uid).set({points: 0});
    })
    .catch(e => alert(e.message));
};

document.getElementById("logoutBtn").onclick = () => {
  auth.signOut();
};

document.getElementById("completeLessonBtn").onclick = () => {
  const user = auth.currentUser;
  if (!user) return alert("Log in first");

  const userRef = db.collection('users').doc(user.uid);
  db.runTransaction(async (transaction) => {
    const doc = await transaction.get(userRef);
    if (!doc.exists) throw "User not found!";
    let newPoints = (doc.data().points || 0) + 10;
    transaction.update(userRef, {points: newPoints});
    return newPoints;
  }).then(newPoints => {
    userPointsSpan.textContent = newPoints;
    alert("Lesson completed! Points updated.");
  }).catch(e => alert("Error updating points: " + e));
};

auth.onAuthStateChanged(user => {
  if (user) {
    loginPanel.style.display = "none";
    userPanel.style.display = "block";
    lessonPanel.style.display = "block";
    userEmailSpan.textContent = user.email;

    // Get user points
    db.collection('users').doc(user.uid).get().then(doc => {
      if (doc.exists) {
        userPointsSpan.textContent = doc.data().points || 0;
      } else {
        userPointsSpan.textContent = 0;
      }
    });
  } else {
    loginPanel.style.display = "block";
    userPanel.style.display = "none";
    lessonPanel.style.display = "none";
    userEmailSpan.textContent = "";
    userPointsSpan.textContent = "0";
  }
});
 — Add lessons for each region:
const lessonsData = {
  east: [
    { word: "Jambo", meaning: "Hello (Swahili)" },
    { word: "Asante", meaning: "Thank you (Swahili)" },
    { word: "Tafadhali", meaning: "Please (Swahili)" }
  ],
  west: [
    { word: "Salut", meaning: "Hello (French - spoken in West African countries)" },
    { word: "Merci", meaning: "Thank you (French)" },
    { word: "S'il vous plaît", meaning: "Please (French)" }
  ],
  southern: [
    { word: "Howzit", meaning: "Hello (South African English slang)" },
    { word: "Ndza khensa", meaning: "Thank you (Tsonga)" },
    { word: "Ngiyacela", meaning: "Please (Zulu)" }
  ],
  central: [
    { word: "Mbote", meaning: "Hello (Lingala)" },
    { word: "Matondo", meaning: "Thank you (Lingala)" },
    { word: "S'il vous plaît", meaning: "Please (French)" }
  ],
  north: [
    { word: "Salam", meaning: "Hello (Arabic - official in North Africa)" },
    { word: "Shukran", meaning: "Thank you (Arabic)" },
    { word: "Min fadlak", meaning: "Please (Arabic)" }
  ],
  horn: [
    { word: "Selam", meaning: "Hello (Amharic - Ethiopia)" },
    { word: "Amesegenallo", meaning: "Thank you (Amharic)" },
    { word: "Ebakeh", meaning: "Please (Tigrinya - Eritrea)" }
  ]
};

const regionSelect = document.getElementById("regionSelect");
const lessonsDiv = document.getElementById("lessons");

regionSelect.addEventListener("change", () => {
  const region = regionSelect.value;
  lessonsDiv.innerHTML = "";

  if (region && lessonsData[region]) {
    const ul = document.createElement("ul");
    lessonsData[region].forEach(lesson => {
      const li = document.createElement("li");
      li.innerHTML = `<b>${lesson.word}</b> - ${lesson.meaning}`;
      ul.appendChild(li);
    });
    lessonsDiv.appendChild(ul);

    // Add complete lesson button
    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Complete Lesson (+10 points)";
    completeBtn.onclick = () => {
      const user = auth.currentUser;
      if (!user) return alert("Log in first");

      const userRef = db.collection('users').doc(user.uid);
      db.runTransaction(async (transaction) => {
        const doc = await transaction.get(userRef);
        if (!doc.exists) throw "User not found!";
        let newPoints = (doc.data().points || 0) + 10;
        transaction.update(userRef, { points: newPoints });
        return newPoints;
      }).then(newPoints => {
        userPointsSpan.textContent = newPoints;
        alert("Lesson completed! Points updated.");
      }).catch(e => alert("Error updating points: " + e));
    };
    lessonsDiv.appendChild(completeBtn);
  }
});
<label for="regionSelect">Select Region:</label>
<select id="regionSelect">
  <option value="">-- Select Region --</option>
  <option value="east">East Africa</option>
  <option value="west">West Africa</option>
  <option value="southern">Southern Africa</option>
  <option value="central">Central Africa</option>
  <option value="north">North Africa</option>
  <option value="horn">Horn of Africa</option>
</select>

<div id="lessons"></div>