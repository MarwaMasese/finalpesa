// signup
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', async(e) => {
  e.preventDefault();
  
  // get user info
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;
  const username = signupForm['signup-username'].value;
console.log(email);
  // sign up the user
await auth.createUserWithEmailAndPassword(email, password).then(cred => {
    console.log(cred.user);
    signupForm.reset();
    window.location.replace("../index.html");
    alert('you have registered successfully');
  });
   await db.collection('users').add({
       name: username,
       email: email,
     });
});