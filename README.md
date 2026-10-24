💜 DevFinder — GitHub Profile Finder

A responsive GitHub Profile Finder built with React and the GitHub REST API as part of my Week 06 Web Development task.

DevFinder lets users search for GitHub developers, view their profile information, and explore their recent public repositories through a clean, responsive interface.

✨ Features

- 🔎 Search GitHub users by username
- 👤 View profile picture, name, username, and bio
- 📊 Display public repository count, followers, and following
- 📁 Explore recent public repositories
- ⭐ View repository descriptions, programming languages, stars, and forks
- 🔗 Open a user's GitHub profile directly
- 🕘 Access recent searches
- 🌙 Toggle between dark mode and light mode
- ⏳ Loading indicator while fetching data
- ⚠️ Helpful error messages for invalid usernames and API errors
- 📱 Responsive layout for desktop and mobile devices

🛠️ Technologies Used

- React
- JavaScript
- CSS
- Vite
- GitHub REST API
- Fetch API
- React Hooks: "useState" and "useEffect"

🌐 API Endpoints

GitHub user profile

"https://api.github.com/users/{username}"

Public repositories

"https://api.github.com/users/{username}/repos?sort=updated&per_page=6"

Replace "{username}" with the GitHub username you want to search for.

🚀 Run Locally

Prerequisites

Install "Node.js" (https://nodejs.org/) and npm.

Installation

1. Clone this repository:
   
   git clone https://github.com/Drishyarao/github-profile-finder-week06.git

2. Enter the project folder:
   
   cd github-profile-finder-week06

3. Install dependencies:
   
   npm install

4. Start the development server:
   
   npm run dev

5. Open the local URL shown in your terminal, usually "http://localhost:5173/".

🧪 Example Searches

Try these public GitHub usernames:

- "octocat"
- "torvalds"

You can also enter another valid GitHub username.

⚠️ Notes

- The application uses the public GitHub REST API and does not require a personal access token for basic public profile searches.
- GitHub API rate limits may temporarily restrict repeated requests.
- Repository information is limited to the recent public repositories returned by the API.

👩‍💻 Project Information

Project: GitHub Profile Finder
Assignment: Week 06 — Web Development
Built with: React and the GitHub REST API

---

Made with 💜 while learning React.