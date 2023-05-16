// Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBWxISbXR8_E4J0e-EV1ryc-QQmT4jMBDo",
  authDomain: "simchat-b2ec1.firebaseapp.com",
  databaseURL: "https://simchat-b2ec1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "simchat-b2ec1",
  storageBucket: "simchat-b2ec1.appspot.com",
  messagingSenderId: "749949408294",
  appId: "1:749949408294:web:d5b934f0b3ddee475382e7",
  measurementId: "G-B1SMFHVZBZ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();

// DOM elements
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupSection = document.getElementById('signup-section');
const signupForm = document.getElementById('signup-form');
const signupUsernameInput = document.getElementById('signup-username');
const signupEmailInput = document.getElementById('signup-email');
const signupPasswordInput = document.getElementById('signup-password');
const cancelBtn = document.getElementById('cancel-btn');
const chatSection = document.getElementById('chat-section');
const usernameSpan = document.getElementById('username');
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message');
const signupBtn = document.getElementById('signup-btn');
const signoutBtn = document.getElementById('signout-btn');

// Hide signup section initially
signupSection.style.display = 'none';

// Show signup section when signup button is clicked
signupBtn.addEventListener('click', () => {
loginForm.style.display = 'none';
signupSection.style.display = 'block';
signupBtn.style.display = 'none';
document.querySelector('.card-title').style.display = 'none';
});

// User login event
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    loginForm.reset();
    hideLoginLabel();
  } catch (error) {
    alert(error.message);
  }
});

// Function to hide the login label
function hideLoginLabel() {
  const loginLabel = document.getElementById('login-label');
  loginLabel.style.display = 'none';
}

// Signup event
signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = signupEmailInput.value;
  const password = signupPasswordInput.value;
  const username = signupUsernameInput.value;

  try {
    await auth.createUserWithEmailAndPassword(email, password);
    // Update user profile with username
    const user = auth.currentUser;
    await user.updateProfile({ displayName: username });

    signupForm.reset();
    loginForm.style.display = 'block';
    signupSection.style.display = 'none';
    alert('Signup successful. Please log in.');
  } catch (error) {
    alert(error.message);
  }
});

// Cancel signup and show login form
cancelBtn.addEventListener('click', () => {
  loginForm.style.display = 'block';
  signupSection.style.display = 'none';
  signupForm.reset();
  signupBtn.style.display = 'block';
  document.querySelector('.card-title').style.display = 'block';
});

// Auth state change listener
auth.onAuthStateChanged(async (user) => {
if (user) {
  // User is signed in
  const { uid, displayName, email } = user;

  chatSection.style.display = 'block';
  usernameSpan.textContent = displayName || email;

  // Hide card title after signing in
  document.querySelector('.card-title').style.display = 'none';

  // Load messages
  firestore.collection('messages').orderBy('timestamp').onSnapshot((snapshot) => {
    messageContainer.innerHTML = '';
    snapshot.forEach((doc) => {
      const { message, sender, timestamp } = doc.data();

      const messageElement = document.createElement('div');
      messageElement.classList.add('message');
      if (sender === displayName || sender === email) {
        messageElement.classList.add('sent');
      } else {
        messageElement.classList.add('received');
      }
      messageElement.textContent = `${sender}: ${message}`;

      const timestampElement = document.createElement('div');
      timestampElement.classList.add('timestamp');
      timestampElement.textContent = timestamp.toDate().toLocaleString();
      messageElement.appendChild(timestampElement);

      messageContainer.appendChild(messageElement);
    });
  });

    // Hide login and signup buttons after login
    loginForm.style.display = 'none';
    signupBtn.style.display = 'none';

    // Sign Out event
    signoutBtn.addEventListener('click', async () => {
      try {
        await auth.signOut();
        chatSection.style.display = 'none';
        loginForm.style.display = 'block';
        document.querySelector('.card-title').style.display = 'block';
        alert('You have been signed out.');
      } catch (error) {
        alert(error.message);
      }
    });

    // Message form submit event
    messageForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const message = messageInput.value;

      try {
        await firestore.collection('messages').add({
          message,
          sender: displayName || email,
          timestamp: firebase.firestore.Timestamp.now()
        });

        messageInput.value = '';
      } catch (error) {
        alert(error.message);
      }
    });
  } else {
    // User is signed out
    chatSection.style.display = 'none';

    // Show login and signup buttons
    loginForm.style.display = 'block';
    signupBtn.style.display = 'block';
  }
});

// Clear the message container and delete messages from Firestore when the "Clear chat" button is clicked
document.getElementById('clear-chat-btn').addEventListener('click', async function() {
try {
  // Delete all messages from Firestore
  const snapshot = await firestore.collection('messages').get();
  const batch = firestore.batch();

  snapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log('Chat cleared successfully.');

  // Clear the message container
  document.getElementById('message-container').innerHTML = '';
} catch (error) {
  alert(error.message);
}
});
