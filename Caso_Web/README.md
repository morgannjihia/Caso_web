# CASO website

A static website for the College Adventist Students Organization (CASO-EKUC), built with plain HTML/CSS/JS and Firebase for the contact form and admin page.

## Folder structure

```
caso-site/
├── index.html          Home page
├── about.html          Mission, vision, objectives, emblem
├── zones.html          Zones & member institutions
├── leadership.html     Government structure & executive roles
├── evangelism.html     Evangelism seasons & involvement
├── contact.html        Contact / join form (writes to Firestore)
├── css/styles.css       All site styling
├── js/
│   ├── firebase-config.js   Your Firebase project keys go here
│   └── main.js               Nav toggle + form submission logic
└── admin/
    ├── index.html       Admin login
    └── dashboard.html   Submissions inbox (requires login)
```

## Setup steps

1. **Create a Firebase project** at https://console.firebase.google.com
2. In the project, enable:
   - **Firestore Database** (start in production mode)
   - **Authentication** → Email/Password sign-in method
3. Go to Project Settings → General → Your apps → add a Web app, and copy the config object.
4. Paste those values into `js/firebase-config.js`, replacing the placeholder strings.
5. In Firebase Authentication, manually add the email/password accounts for whichever executive officers should have admin access (e.g. Chairperson, Secretary).
6. Set Firestore security rules so visitors can only create submissions, and only logged-in users can read them:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /submissions/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

## Deploying

1. Push this folder to a GitHub repository.
2. Go to https://vercel.com, import the repo, and deploy (no build step needed — it's static HTML).
3. Every push to the main branch will auto-deploy.

## Editing content

- Page text lives directly in each `.html` file — search for the section you want to change.
- Zone/institution lists are in `zones.html` inside `<details>` blocks.
- Colors and fonts are defined once at the top of `css/styles.css` under `:root`.

## Next steps (optional)

- Add real names/photos to `leadership.html` once available.
- Add an events/evangelism calendar collection in Firestore, editable from the admin dashboard.
- Add zone/institution editing to the admin dashboard instead of hardcoded HTML.
